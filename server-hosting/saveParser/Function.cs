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
        await LambdaBootstrapBuilder.Create(FunctionHandler, new DefaultLambdaJsonSerializer())
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

    public static async Task<string> FunctionHandler(ILambdaContext context)
    {
        Console.WriteLine($"Starting...");

        const string lastFileParsedKey = "saveDetails/details.txt";
        const string lastFileParsedInfoKey = "saveDetails/lastFileParsed.txt";
        string? lastProcessedFile = null;

        try
        {
            using var response = await s3Client.GetObjectStreamAsync(bucketName, lastFileParsedInfoKey, null);
            using StreamReader reader = new(response);
            lastProcessedFile = await reader.ReadToEndAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"lastProcessedFile not found: {ex.Message}");
        }

        var file = await LastSaveFileName();

        Console.WriteLine($"LastSave: {file} LastProcessed: {lastProcessedFile}");
        if (file != lastProcessedFile)
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
            await s3Client.PutObjectAsync(new() { BucketName = bucketName, Key = lastFileParsedInfoKey, ContentBody = file });

            Console.WriteLine($"Done");
        }
        else
        {
            Console.WriteLine($"Skipping");
        }

        return "";
    }
}
