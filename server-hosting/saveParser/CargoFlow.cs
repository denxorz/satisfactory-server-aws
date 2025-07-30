namespace SaveParser;

public record CargoFlow(string Type, bool IsUnload, int? FlowPerMinute, bool IsExact);

