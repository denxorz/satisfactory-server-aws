namespace SaveParser;

public record Station(string Id, string Name, List<string> CargoTypes, bool IsUnload, List<Transporter> Transporters);
