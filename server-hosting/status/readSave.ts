import { BoolProperty, ObjectProperty, Parser, SaveEntity, StructArrayProperty, TextProperty } from '@etothepii/satisfactory-file-parser';
import { StationsFromSaveResult, TrainStation, TrainStationLocation, TrainStationPlatform, Train, InventoryEntry } from './types';

export async function getStationsFromSave(saveFileBuffer: Buffer): Promise<StationsFromSaveResult> {
  const arrayBuffer = saveFileBuffer.buffer.slice(
    saveFileBuffer.byteOffset,
    saveFileBuffer.byteOffset + saveFileBuffer.byteLength
  );

  const save = Parser.ParseSave('SaveFile', arrayBuffer);

  const trainStations: Map<string, TrainStation> = new Map();
  const trainStationsLocation: Map<string, TrainStationLocation> = new Map();
  const trainStationsPlatforms: Map<string, TrainStationPlatform> = new Map();
  const droneStations: any[] = [];
  const truckStations: any[] = [];
  const trains: Train[] = [];
  const inventory: Map<string, InventoryEntry> = new Map();
  const other: any[] = [];

  for (const level of Object.values(save.levels || {})) {
    for (const obj of level.objects || []) {

      if (obj.typePath === "/Script/FactoryGame.FGTrainStationIdentifier") {
        trainStations.set(obj.instanceName, {
          id: obj.instanceName,
          name: (obj.properties.mStationName as TextProperty).value.value ?? '??',
          locationId: (obj.properties.mStation as ObjectProperty).value.pathName,
          location: undefined as any,
          trainsStopping: [],
          //raw: obj as SaveEntity,
        });
      }
      else if (obj.typePath === "/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainStation.Build_TrainStation_C") {
        trainStationsLocation.set(obj.instanceName, {
          id: obj.instanceName,
          x: (obj as any).transform.translation.x,
          y: (obj as any).transform.translation.y,
          //raw: obj as SaveEntity,
        });
      }
      else if (obj.typePath === "/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStation.Build_TrainDockingStation_C") {
        const locationId = (obj.properties.mStationDockingMaster as ObjectProperty)?.value.pathName;
        trainStationsPlatforms.set(locationId, {
          id: obj.instanceName,
          isUnloading: (obj.properties.mIsLoadUnloading as BoolProperty)?.value ?? false,
          locationId: locationId,
          inventoryId: (obj.properties.mInventory as ObjectProperty)?.value.pathName,
          //raw: obj as SaveEntity,
        });
      }
      else if (obj.typePath === "/Script/FactoryGame.FGDroneStationInfo") {
        droneStations.push({
          id: obj.instanceName, name: (obj.properties.mBuildingTag as TextProperty).value,
         // raw: obj as SaveEntity,
        });
      }
      else if (obj.typePath === "/Script/FactoryGame.FGDockingStationInfo") {
        truckStations.push({
          id: obj.instanceName,
          name: (obj.properties.mBuildingTag as TextProperty).value,
        //  raw: obj as SaveEntity,
        });
      }
      else if (obj.typePath === "/Script/FactoryGame.FGRailroadTimeTable") {
        trains.push({
          id: obj.instanceName,
          stops: (obj.properties.mStops as StructArrayProperty)
            ?.values
            ?.map(stop => (stop.value as any))
            .map(stop => ({
              stationId: stop.properties.Station.value.pathName
            })),
         // raw: obj as SaveEntity,
        });
      }
      else if (obj.typePath === "/Script/FactoryGame.FGInventoryComponent") {
        const items = (obj.properties.mInventoryStacks as StructArrayProperty)?.values?.filter(v => v.value !== null);
        inventory.set(obj.instanceName, ({
          id: obj.instanceName,
          firstItemTypeId: (items?.[0]?.value as any)?.properties.Item.value.itemReference.pathName,
          //raw: obj as SaveEntity,
        }));
      }
      else if (obj.instanceName.endsWith("Persistent_Level:PersistentLevel.Build_TrainDockingStation_C_2142679459.inventory")
        //obj.typePath.includes("FGWheeledVehicleInfo")
        // && !obj.typePath.endsWith("Spawnable")
        // && obj.typePath !== "/Script/FactoryGame.FGPowerConnectionComponent"
        // && obj.typePath !== "/Script/FactoryGame.FGPowerInfoComponent"
        // && obj.typePath !== "/Script/FactoryGame.FGPowerCircuit"
        // && obj.typePath !== "/Script/FactoryGame.FGInventoryComponent"
        // && obj.typePath !== "/Script/FactoryGame.FGMapManager"
        // && obj.typePath !== "/Script/FactoryGame.FGPipeNetwork"
        // && obj.typePath !== "/Script/FactoryGame.FGPipeSubsystem"
        // && obj.typePath !== "/Script/FactoryGame.FGPipeConnectionComponent"
        // && obj.typePath !== "/Script/FactoryGame.FGPipeConnectionFactory"
        // && obj.typePath !== "/Script/FactoryGame.FGPipeConnectionComponentHyper"
        // && obj.typePath !== "/Script/FactoryGame.FGResourceSinkSubsystem"
        // && obj.typePath !== "/Script/FactoryGame.FGStatisticsSubsystem"
        // && obj.typePath !== "/Script/FactoryGame.FGRecipeManager"
        // && obj.typePath !== "/Script/FactoryGame.FGFoliageRemovalSubsystem"
        // && obj.typePath !== "/Script/FactoryGame.FGWorldSettings"
        // && obj.typePath !== "/Script/FactoryGame.FGConveyorChainActor"
        // && obj.typePath !== "/Script/FactoryGame.FGBlueprintProxy"
        // && obj.typePath !== "/Script/FactoryGame.FGBlueprintShortcut"
        // && obj.typePath !== "/Script/FactoryGame.FGConveyorChainActor_RepSizeMedium"
        // && obj.typePath !== "/Script/FactoryGame.FGConveyorChainActor_RepSizeLarge"
        // && obj.typePath !== "/Script/FactoryGame.FGConveyorChainActor_RepSizeHuge"
        // && obj.typePath !== "/Script/FactoryGame.FGWheeledVehicleInfo"
        // && obj.typePath !== "/Script/FactoryGame.FGRailroadTrackConnectionComponent"
        // || obj.typePath == "/Script/FactoryGame.FGTrainPlatformConnection"
        // && obj.typePath !== "/Script/FactoryGame.FGFactoryConnectionComponent"
        // && obj.typePath !== "/Script/FactoryGame.FGFactoryLegsComponent"
        // && obj.typePath !== "/Script/FactoryGame.FGHealthComponent"
        // && obj.typePath !== "/Script/FactoryGame.FGShoppingListComponent"
        // && obj.typePath !== "/Script/FactoryGame.FGPlayerHotbar"
        // && obj.typePath !== "/Script/FactoryGame.FGRecipeShortcut"
        // && obj.typePath !== "/Script/FactoryGame.FGInventoryComponentEquipment"
        // && obj.typePath !== "/Script/FactoryGame.FGInventoryComponentTrash"
        // && obj.typePath !== "/Script/FactoryGame.FGDroneMovementComponent"
        // && obj.typePath !== "/Script/FactoryGame.FGFactoryCustomizationShortcut"
        // && obj.typePath !== "/Script/FactoryGame.FGEmoteShortcut"
        // && obj.typePath !== "/Script/FactoryGame.FGDrivingTargetList"
        // && obj.typePath !== "/Script/FactoryGame.FGSavedWheeledVehiclePath"
        // && obj.typePath !== "/Script/FactoryGame.FGGameRulesSubsystem"
        // && obj.typePath !== "/Script/FactoryGame.FGScannableSubsystem"
        // && obj.typePath !== "/Script/FactoryGame.FGCentralStorageSubsystem"
        // && obj.typePath !== "/Script/FactoryGame.FGLightweightBuildableSubsystem"
      ) {
        other.push(obj);
      }
    }
  }

  for (const [, station] of trainStations) {
      station.location = trainStationsLocation.get(station.locationId);
      station.platform = trainStationsPlatforms.get(station.locationId);
  }

  for (const [, platform] of trainStationsPlatforms) {
    platform.location = trainStationsLocation.get(platform.locationId);
    platform.inventory = inventory.get(platform.inventoryId ?? '');
  }

  toJson(Array.from(trainStationsPlatforms.values()), "trainPlatforms.json");

  for (const train of trains) {
    train.stops ??= [];
  }

  for (const [, station] of trainStations) {
    station.trainsStopping = trains.filter(train => train.stops.some(stop => stop.stationId === station.id));
}

  return {
    trainStations,
    trains,
    droneStations,
    truckStations,
    other
  };
}

function toJson(anyArray: any, outputPath: string) {
  const fs = require('fs');
  fs.writeFileSync(outputPath, JSON.stringify(anyArray, null, 2), 'utf-8');
}
