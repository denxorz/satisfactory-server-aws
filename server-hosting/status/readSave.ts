import { ObjectProperty, Parser, StructArrayProperty, TextProperty } from '@etothepii/satisfactory-file-parser';

export async function getStationsFromSave(saveFileBuffer: Buffer): Promise<{
  trainStations: any[],
  trainStationsBuilds: any[],
  trains: any[],
  droneStations: any[],
  truckStations: any[],
  other: any[]
}> {
  const arrayBuffer = saveFileBuffer.buffer.slice(
    saveFileBuffer.byteOffset,
    saveFileBuffer.byteOffset + saveFileBuffer.byteLength
  );

  const save = Parser.ParseSave('SaveFile', arrayBuffer);

  const trainStations: any[] = [];
  const trainStationsBuilds: any[] = [];
  const droneStations: any[] = [];
  const truckStations: any[] = [];
  const trains: any[] = [];
  const other: any[] = [];

  for (const level of Object.values(save.levels || {})) {
    for (const obj of level.objects || []) {

      if (obj.typePath === "/Script/FactoryGame.FGTrainStationIdentifier") {
        trainStations.push({
          instanceName: obj.instanceName,
          name: (obj.properties.mStationName as TextProperty).value.value,
          stationPathName: (obj.properties.mStation as ObjectProperty).value.pathName,
          raw: obj,
        });
      }
      else if (obj.typePath === "/Script/FactoryGame.FGDroneStationInfo") {
        droneStations.push({
          instanceName: obj.instanceName, name: (obj.properties.mBuildingTag as TextProperty).value,
          raw: obj,
        });
      }
      else if (obj.typePath === "/Script/FactoryGame.FGDockingStationInfo") {
        truckStations.push({
          instanceName: obj.instanceName,
          name: (obj.properties.mBuildingTag as TextProperty).value,
          raw: obj,
        });
      }
      else if (obj.typePath === "/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainStation.Build_TrainStation_C") {
        trainStationsBuilds.push({
          instanceName: obj.instanceName,
          x: (obj as any).transform.translation.x,
          y: (obj as any).transform.translation.y,
          raw: obj,
        });
      }
      else if (obj.typePath === "/Script/FactoryGame.FGRailroadTimeTable") {
        trains.push({
          instanceName: obj.instanceName,
          stops: (obj.properties.mStops as StructArrayProperty)?.values?.map(stop => (stop.value as any)).map(stop => ({
            name: stop.properties.Station.value.pathName,
            unload: stop.properties.DockingRuleSet.value.properties.DockingDefinition.value.value.includes('Unload')
          })),
          raw: obj,
        });
      }
      else if (obj.typePath.includes("FGWheeledVehicleInfo")
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
        // && obj.typePath !== "/Script/FactoryGame.FGTrainPlatformConnection"
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

  return { trainStations, trainStationsBuilds, trains, droneStations, truckStations, other };
}
