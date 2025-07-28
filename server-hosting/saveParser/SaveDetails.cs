using SatisfactorySaveNet;
using SatisfactorySaveNet.Abstracts;
using SatisfactorySaveNet.Abstracts.Model;
using SatisfactorySaveNet.Abstracts.Model.Properties;
using SatisfactorySaveNet.Abstracts.Model.Typed;

namespace SaveParser;

public record SaveDetails(List<Station> Stations)
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

        var objectsByName = objects.ToDictionary(o => o.ObjectReference.PathName, o => o);

        return new([
            .. ParseTrainStations(objects, objectsByName),
            .. ParseDroneStations(objects, objectsByName),
            .. ParseTruckStations(objects, objectsByName),
        ]);
    }

    public static IEnumerable<Station> ParseTrainStations(List<ComponentObject> objects, Dictionary<string, ComponentObject> objectsByName)
    {
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
        return trainStations
            .OfType<ActorObject>()
            .Select(t =>
            {
                var id = t.ObjectReference.PathName;
                var stationIdentifier = trainStationIdentifiersRefined[id];
                var platforms = trainStationConnectionToPlatformsRefined[id];
                var inventory = platforms.Count > 0 ? objectsByName[platforms[0]!.InventoryId] : null;

                return new Station(
                    id.Split("_")[^1],
                    stationIdentifier.Name,
                    "train",
                    ToCargoTypes(inventory),
                    platforms.Count > 0 && platforms[0]!.IsUnloadMode,
                    [.. trainTimeTablesRefined.Where(ttt => ttt.StopStationIds.Contains(stationIdentifier.Id)).Select(ttt => new Transporter(ttt.Id.Split("_")[^1]))],
                    t.Position.X,
                    t.Position.Y
                );
            });
    }

    public static IEnumerable<Station> ParseDroneStations(List<ComponentObject> objects, Dictionary<string, ComponentObject> objectsByName)
    {
        // Drone parts By TypePath
        var droneRelatedObjects = objects
            .Where(o => o.TypePath.Contains("drone", StringComparison.InvariantCultureIgnoreCase))
            .ToList();

        var droneRelatedObjectsByType = droneRelatedObjects
            .GroupBy(o => o.TypePath)
            .ToDictionary(o => o.Key, o => o.ToList());

        // Drone Station Identifier, by StationId. I.e. Persistent_Level:PersistentLevel.Build_DroneStation_C_2144148257
        var droneStationIdentifiers = droneRelatedObjectsByType["/Script/FactoryGame.FGDroneStationInfo"];
        var droneStationIdentifiersRefined = droneStationIdentifiers
            .Select(t => new
            {
                Id = t.ObjectReference.PathName,
                Name = (t.Properties.FirstOrDefault(p => p.Name == "mBuildingTag") as StrProperty)?.Value ?? "??",
                DroneStationId = (t.Properties.FirstOrDefault(p => p.Name == "mStation") as ObjectProperty)?.Value.PathName ?? "??",
                PairedStationId = (t.Properties.FirstOrDefault(p => p.Name == "mPairedStation") as ObjectProperty)?.Value.PathName ?? "??", //Persistent_Level:PersistentLevel.FGDroneStationInfo_2147135058
            })
            .ToDictionary(t => t.DroneStationId, t => t);

        // Drone Station, by StationId. I.e. Persistent_Level:PersistentLevel.Build_DroneStation_C_2144148257
        var droneStations = droneRelatedObjectsByType["/Game/FactoryGame/Buildable/Factory/DroneStation/Build_DroneStation.Build_DroneStation_C"];
        return droneStations
            .OfType<ActorObject>()
            .Select(t =>
            {
                var id = t.ObjectReference.PathName;
                var stationIdentifier = droneStationIdentifiersRefined[id];
                var drone = (t.Properties.FirstOrDefault(p => p.Name == "mStationDrone") as ObjectProperty)?.Value.PathName ?? "??";
                var inputInventory = objectsByName[(t.Properties.FirstOrDefault(p => p.Name == "mInputInventory") as ObjectProperty)?.Value.PathName ?? "??"];
                var outputInventory = objectsByName[(t.Properties.FirstOrDefault(p => p.Name == "mOutputInventory") as ObjectProperty)?.Value.PathName ?? "??"];
                var inputCargoTypes = ToCargoTypes(inputInventory);
                var outputCargoTypes = ToCargoTypes(outputInventory);
                var isUnload = inputCargoTypes.Count <= outputCargoTypes.Count;

                return new Station(
                    id.Split("_")[^1],
                    stationIdentifier.Name,
                    "drone",
                    [.. inputCargoTypes, .. outputCargoTypes],
                    isUnload,
                    [new Transporter(drone.Split("_")[^1])],
                    t.Position.X,
                    t.Position.Y
                );
            });
    }

    public static IEnumerable<Station> ParseTruckStations(List<ComponentObject> objects, Dictionary<string, ComponentObject> objectsByName)
    {
        // Truck parts By TypePath
        var truckRelatedObjects = objects
            .Where(o => o.TypePath.Contains("truck", StringComparison.InvariantCultureIgnoreCase)
            || o.TypePath.Contains("vehicle", StringComparison.InvariantCultureIgnoreCase)
            || o.TypePath.Contains("docking", StringComparison.InvariantCultureIgnoreCase)
            || o.TypePath.Contains("driving", StringComparison.InvariantCultureIgnoreCase)
            )
            .ToList();

        var truckRelatedObjectsByType = truckRelatedObjects
            .GroupBy(o => o.TypePath)
            .ToDictionary(o => o.Key, o => o.ToList());

        // Truck Station Identifier, by StationId. I.e. Persistent_Level:PersistentLevel.Build_TruckStation_C_2144148257
        var truckStationIdentifiers = truckRelatedObjectsByType["/Script/FactoryGame.FGDockingStationInfo"];
        var truckStationIdentifiersRefined = truckStationIdentifiers
            .Select(t => new
            {
                Id = t.ObjectReference.PathName,
                Name = (t.Properties.FirstOrDefault(p => p.Name == "mBuildingTag") as StrProperty)?.Value ?? "??",
                TruckStationId = (t.Properties.FirstOrDefault(p => p.Name == "mStation") as ObjectProperty)?.Value.PathName ?? "??",
                PairedStationId = (t.Properties.FirstOrDefault(p => p.Name == "mPairedStation") as ObjectProperty)?.Value.PathName ?? "??", //Persistent_Level:PersistentLevel.FGTruckStationInfo_2147135058
            })
            .ToDictionary(t => t.TruckStationId, t => t);

        // Truck Station, by StationId. I.e. Persistent_Level:PersistentLevel.Build_TruckStation_C_2144148257
        var truckStations = truckRelatedObjectsByType["/Game/FactoryGame/Buildable/Factory/TruckStation/Build_TruckStation.Build_TruckStation_C"];
        return truckStations
            .OfType<ActorObject>()
            .Select(t =>
            {
                var id = t.ObjectReference.PathName;
                var stationIdentifier = truckStationIdentifiersRefined[id];
                var inventory = objectsByName[(t.Properties.FirstOrDefault(p => p.Name == "mInventory") as ObjectProperty)?.Value.PathName ?? "??"];
                var cargoTypes = ToCargoTypes(inventory);
                var output0 = objectsByName[t.Components.First(c => c.PathName.Contains("output0", StringComparison.InvariantCultureIgnoreCase)).PathName];
                var output1 = objectsByName[t.Components.First(c => c.PathName.Contains("output1", StringComparison.InvariantCultureIgnoreCase)).PathName];
                var isUnload = output0.Properties.Count > 0 || output1.Properties.Count > 0;

                return new Station(
                    id.Split("_")[^1],
                    stationIdentifier.Name,
                    "truck",
                    cargoTypes,
                    isUnload,
                    [],
                    t.Position.X,
                    t.Position.Y
                );
            });
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

