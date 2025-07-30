namespace SaveParser;

public record Station(
    string Id,
    string Name,
    string Type,
    List<string> CargoTypes,
    List<CargoFlow> CargoFlows,
    bool IsUnload,
    List<Transporter> Transporters,
    float X,
    float Y);
