using System.Text.Json;
using System.Text.Json.Serialization;
using Amazon.Lambda.Core;
using Amazon.Lambda.RuntimeSupport;
using Amazon.Lambda.Serialization.SystemTextJson;
using Amazon.S3;
using Denxorz.Satisfactory.Routes;

namespace SaveParser;

public static class Function
{
    private static readonly IAmazonS3 s3Client = new AmazonS3Client();
    private static readonly string bucketName = Environment.GetEnvironmentVariable("bucketName") ?? "";

    private static readonly JsonSerializerOptions serializeOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    private static async Task Main()
    {
        await LambdaBootstrapBuilder.Create<LambdaInput>(FunctionHandler, new DefaultLambdaJsonSerializer())
            .Build()
            .RunAsync();
    }

    private static async Task<string?> LastSaveFileName()
    {
        try
        {
            var savesListResponse = await s3Client.ListObjectsV2Async(new() { BucketName = bucketName, Prefix = "saves" });
            var saves = savesListResponse.S3Objects;

            Console.WriteLine($"Saves total: {saves.Count}");

            if (saves.Count > 0)
            {
                var sortedSaves = saves.OrderByDescending(a => a.LastModified).ToList();
                return sortedSaves[0].Key;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"LastSaveFileName error: {ex.Message}");
        }
        return null;

    }

    private static async Task<DateTime?> GetFileDate(string? fileName)
    {
        if (string.IsNullOrEmpty(fileName))
            return null;

        try
        {
            var savesListResponse = await s3Client.ListObjectsV2Async(new() { BucketName = bucketName, Prefix = "saves" });
            var file = savesListResponse.S3Objects.FirstOrDefault(s => s.Key == fileName);
            return file?.LastModified;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetFileDate error: {ex.Message}");
        }
        return null;
    }

    public class SaveDetailsBuildInfo
    {
        public string? FileName { get; set; }
        public DateTime? FileDate { get; set; }
        public DateTime ParsedDate { get; set; }
    }

    public class LambdaInput
    {
        public bool ForceRebuild { get; set; }
    }

    public static async Task<string> FunctionHandler(LambdaInput? input, ILambdaContext context)
    {
        Console.WriteLine($"Starting...");

        const string lastFileParsedKey = "saveDetails/details.txt";
        const string saveDetailsBuildInfoKey = "saveDetails/saveDetailsBuildInfo.txt";
        string? lastProcessedFile = null;
        bool forceRebuild = input?.ForceRebuild ?? false;

        Console.WriteLine($"Force rebuild requested: {forceRebuild}");

        if (!forceRebuild)
        {
            try
            {
                var saveDetailsBuildInfoResponse = await s3Client.GetObjectStreamAsync(bucketName, saveDetailsBuildInfoKey, null);
                var saveDetailsBuildInfoJson = await new StreamReader(saveDetailsBuildInfoResponse).ReadToEndAsync();
                var saveDetailsBuildInfo = JsonSerializer.Deserialize<SaveDetailsBuildInfo>(saveDetailsBuildInfoJson, serializeOptions);
                lastProcessedFile = saveDetailsBuildInfo?.FileName;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"saveDetailsBuildInfo not found: {ex.Message}");
            }
        }

        var file = await LastSaveFileName();

        Console.WriteLine($"LastSave: {file} LastProcessed: {lastProcessedFile} ForceRebuild: {forceRebuild}");
        if (file != lastProcessedFile || forceRebuild)
        {
            using var saveFileStream = await s3Client.GetObjectStreamAsync(bucketName, file, null);
            using var saveFileMemoryStream = new MemoryStream();
            await saveFileStream.CopyToAsync(saveFileMemoryStream);
            saveFileMemoryStream.Position = 0;

            var details = SaveDetails.LoadFromStream(saveFileMemoryStream);

            var outputMemoryStream = new MemoryStream();
            await JsonSerializer.SerializeAsync(outputMemoryStream, details, serializeOptions);
            outputMemoryStream.Position = 0;

            await s3Client.PutObjectAsync(new() { BucketName = bucketName, Key = lastFileParsedKey, InputStream = outputMemoryStream });

            var saveDetailsBuildInfo = new SaveDetailsBuildInfo
            {
                FileName = file,
                FileDate = await GetFileDate(file),
                ParsedDate = DateTime.UtcNow
            };

            var saveDetailsBuildInfoMemoryStream = new MemoryStream();
            await JsonSerializer.SerializeAsync(saveDetailsBuildInfoMemoryStream, saveDetailsBuildInfo, serializeOptions);
            saveDetailsBuildInfoMemoryStream.Position = 0;

            await s3Client.PutObjectAsync(new() { BucketName = bucketName, Key = saveDetailsBuildInfoKey, InputStream = saveDetailsBuildInfoMemoryStream });

            Console.WriteLine($"Done");
        }
        else
        {
            Console.WriteLine($"Skipping");
            
            if (!string.IsNullOrEmpty(file))
            {
                try
                {
                    await s3Client.GetObjectAsync(bucketName, saveDetailsBuildInfoKey);
                }
                catch
                {
                    var saveDetailsBuildInfo = new SaveDetailsBuildInfo
                    {
                        FileName = file,
                        FileDate = await GetFileDate(file),
                        ParsedDate = DateTime.UtcNow
                    };

                    var saveDetailsBuildInfoMemoryStream = new MemoryStream();
                    await JsonSerializer.SerializeAsync(saveDetailsBuildInfoMemoryStream, saveDetailsBuildInfo, serializeOptions);
                    saveDetailsBuildInfoMemoryStream.Position = 0;

                    await s3Client.PutObjectAsync(new() { BucketName = bucketName, Key = saveDetailsBuildInfoKey, InputStream = saveDetailsBuildInfoMemoryStream });
                    
                    Console.WriteLine($"Created save details build info for existing file");
                }
            }
        }

        return "";
    }
}
