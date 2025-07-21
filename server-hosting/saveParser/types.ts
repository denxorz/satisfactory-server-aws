import { SaveEntity } from '@etothepii/satisfactory-file-parser';

export interface TrainStationLocation {
  id: string;
  x: number;
  y: number;
  raw?: SaveEntity;
}

export interface TrainStation {
  id: string;
  name: string;
  locationId: string;
  location?: TrainStationLocation;
  platform?: TrainStationPlatform;
  trainsStopping: Train[];
  raw?: SaveEntity;
}

export interface TrainStationPlatform {
  id: string;
  locationId: string;
  location?: TrainStationLocation;
  inventoryId?: string;
  inventory?: InventoryEntry;
  isUnloading: boolean;
  raw?: SaveEntity;
}

export interface TrainStop {
  stationId: string;
}

export interface Train {
  id: string;
  stops: TrainStop[];
  raw?: SaveEntity;
}

export interface InventoryEntry {
  id: string;
  firstItemTypeId?: string;
  raw?: SaveEntity;
}

export interface StationsFromSaveResult {
  trainStations: Map<string, TrainStation>;
  trains: Train[];
  droneStations: any[];
  truckStations: any[];
  other: any[];
} 