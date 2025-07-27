using SatisfactorySaveNet;
using SatisfactorySaveNet.Abstracts;
using SatisfactorySaveNet.Abstracts.Model;
using SatisfactorySaveNet.Abstracts.Model.Properties;
using SatisfactorySaveNet.Abstracts.Model.Typed;

namespace SaveParser;

public record SaveDetails(List<TrainStation> TrainStations)
{
    public static SaveDetails LoadFromStream(Stream stream)
    {
        ISaveFileSerializer serializer = SaveFileSerializer.Instance;
        var saveGame = serializer.Deserialize(stream);

        var objects = saveGame.Body is BodyV8 v8
            ? v8
                .Levels
                .SelectMany(l => l.Objects)
                .ToList()
            : [];

        // By PathName
        var objectsByName = objects
            .ToDictionary(o => o.ObjectReference.PathName, o => o);

        // Train parts By TypePath
        var trainRelatedObjects = objects
            .Where(o => o.TypePath.Contains("train", StringComparison.InvariantCultureIgnoreCase) || o.TypePath.Contains("rail", StringComparison.InvariantCultureIgnoreCase))
            .ToList();

        var trainRelatedObjectsByType = trainRelatedObjects
            .GroupBy(o => o.TypePath)
            .ToDictionary(o => o.Key, o => o.ToList());

        // Train Timetable, by PathName. I.e. Persistent_Level:PersistentLevel.FGRailroadTimeTable_2146071228
        var trainTimeTables = trainRelatedObjectsByType["/Script/FactoryGame.FGRailroadTimeTable"];
        var trainTimeTablesRefined = trainTimeTables
            .Select(t => new
            {
                Id = t.ObjectReference.PathName,
                StopStationIds = ToStops(t.Properties.FirstOrDefault())
            })
            .ToList();

        // Train Station Identifier, by StationId. I.e. Persistent_Level:PersistentLevel.Build_TrainStation_C_2147007670
        var trainStationIdentifiers = trainRelatedObjectsByType["/Script/FactoryGame.FGTrainStationIdentifier"];
        var trainStationIdentifiersRefined = trainStationIdentifiers
            .Select(t => new
            {
                Id = t.ObjectReference.PathName,
                Name = (t.Properties.FirstOrDefault(p => p.Name == "mStationName") as TextProperty)?.Value ?? "??",
                TrainStationId = (t.Properties.FirstOrDefault(p => p.Name == "mStation") as ObjectProperty)?.Value.PathName ?? "??",
            })
            .ToDictionary(t => t.TrainStationId, t => t);

        // Train Station Docking Platform, by DockingStationId. I.e. Persistent_Level:PersistentLevel.Build_TrainDockingStation_C_2147007379
        var trainStationDockings = trainRelatedObjectsByType["/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStation.Build_TrainDockingStation_C"];
        var trainStationDockingsRefined = trainStationDockings
            .OfType<ActorObject>()
            .Select(t => new
            {
                Id = t.ObjectReference.PathName,
                InventoryId = (t.Properties.FirstOrDefault(p => p.Name == "mInventory") as ObjectProperty)?.Value.PathName ?? "??",
                IsUnloadMode = t.Properties.FirstOrDefault(p => p.Name == "mIsInLoadMode") is BoolProperty { Value: 0 },
            })
            .ToDictionary(t => t.Id, t => t);

        // Train Station Docking Platform, by StationId. I.e. Persistent_Level:PersistentLevel.Build_TrainStation_C_2147007670
        var trainStationConnections = trainRelatedObjectsByType["/Script/FactoryGame.FGTrainPlatformConnection"];
        var trainStationConnectionsRefined = trainStationConnections.GroupBy(t => t.ParentActorName).ToDictionary(t => t.Key, t => t.ToList());
        var trainStationConnectionToPlatformsRefined = trainStationConnectionsRefined
            .ToDictionary(
                t => t.Key,
                t => t.Value
                .Select(tt => trainStationDockingsRefined.TryGetValue(string.Join('.', (tt.Properties.FirstOrDefault(o => o.Name == "mConnectedTo") as ObjectProperty)?.Value.PathName.Split('.')[..^1] ?? []), out var aa0) ? aa0 : null)
                .Where(tt => tt is not null)
                .ToList());

        // Train Station, by StationId. I.e. Persistent_Level:PersistentLevel.Build_TrainStation_C_2147007670
        var trainStations = trainRelatedObjectsByType["/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainStation.Build_TrainStation_C"];
        var trainStationsRefined = trainStations
            .OfType<ActorObject>()
            .Select(t =>
            {
                var id = t.ObjectReference.PathName;
                var stationIdentifier = trainStationIdentifiersRefined[id];
                var platforms = trainStationConnectionToPlatformsRefined[id];
                var inventory = platforms.Count > 0 ? objectsByName[platforms[0]!.InventoryId] : null;
                // TODO: Add t.Position

                return new TrainStation(
                    id.Split("_")[^1],
                    stationIdentifier.Name,
                    ToCargoTypes(inventory),
                    platforms.Count > 0 && platforms[0]!.IsUnloadMode,
                    [.. trainTimeTablesRefined.Where(ttt => ttt.StopStationIds.Contains(stationIdentifier.Id)).Select(ttt => new Train(ttt.Id.Split("_")[^1]))]
                );
            })
            .ToList();

        return new(trainStationsRefined);
    }

    private static string[] ToStops(Property? p)
    {
        var arrayProperty = p as ArrayProperty;
        var arrayPropertyValues = arrayProperty?.Property is ArrayStructProperty arrayStruct ? arrayStruct.Values : [];
        var arrayProperties = arrayPropertyValues.OfType<ArrayProperties>();
        var stationIds = arrayProperties
            .SelectMany(sp => sp.Values
                .Where(spp => spp.Name == "Station")
                .OfType<ObjectProperty>()
                .Select(spp => spp.Value.PathName))
            .ToArray();

        return stationIds;
    }

    private static List<string> ToCargoTypes(ComponentObject? inventory)
    {
        if (inventory is null)
        {
            return [];
        }

        var stacks = ((inventory.Properties.FirstOrDefault(p => p.Name == "mInventoryStacks") as ArrayProperty)?.Property as ArrayStructProperty)?.Values as TypedData[] ?? [];
        var inventoryItemStacks = stacks.Select(s => ((s as ArrayProperties)?.Values.FirstOrDefault() as StructProperty)?.Value as InventoryItem);
        var allStacksWithItems = inventoryItemStacks.Where(item => item?.ExtraProperty is IntProperty { Value: > 0 });
        var allStacksWithItemsDistinct = allStacksWithItems.Select(s => s?.ItemType?.Split("/")[5] ?? "").Distinct().Where(s => !string.IsNullOrWhiteSpace(s));
        return [.. allStacksWithItemsDistinct];
    }
}

