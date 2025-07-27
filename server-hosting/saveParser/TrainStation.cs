namespace SaveParser;

public record TrainStation(string Id, string Name, List<string> CargoTypes, bool IsUnload, List<Train> Trains);

