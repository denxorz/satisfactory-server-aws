import { readFileSync } from "fs";
import { getStationsFromSave } from "./readSave";
import { TrainStation, Train } from "./types";

function writeRawTrainStationsToJson(stations: any, outputPath: string) {
  const fs = require('fs');
  fs.writeFileSync(outputPath, JSON.stringify(stations, null, 2), 'utf-8');
}

function writeTrainGraphToDot(stations: Map<string, TrainStation>, trains: Train[], outputPath: string) {
  const fs = require('fs');
  let dot = 'digraph TrainNetwork {\n';
  dot += '  node [shape=rectangle];\n  overlap=false\n  splines=curved\n';

  // Find min/max for scaling
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const station of Array.from(stations.values())) {
    if (typeof station.location?.x === 'number' && typeof station.location?.y === 'number') {
      if (station.location.x < minX) minX = station.location.x;
      if (station.location.x > maxX) maxX = station.location.x;
      if (station.location.y < minY) minY = station.location.y;
      if (station.location.y > maxY) maxY = station.location.y;
    }
  }
  const width = maxX - minX;
  const height = maxY - minY;
  const scale = Math.min(30 / width, 30 / height);

  // Add nodes with scaled position and label
  for (const station of Array.from(stations.values())) {
    if (typeof station.location?.x === 'number' && typeof station.location?.y === 'number') {
      const scaledX = Math.round((station.location?.x - minX) * scale);
      const scaledY = 30 - (Math.round((station.location?.y - minY) * scale));
      dot += `  "${station.id.split("_").pop()}" [label="${station.name}", pos="${scaledX},${scaledY}!"]\n`;
    } else {
      dot += `  "${station.id.split("_").pop()}" [label="${station.name}"]\n`;
    }
  }

  // Add edges for each train's route
  for (const train of trains) {
    if (train.stops && train.stops.length > 1) {

      const stopsUnloadLast = train.stops
        .map(stop => ({ ...stop, station: stations.get(stop.stationId) }))
        .sort((a, b) => {
          if (a.station?.platform?.isUnloading && !b.station?.platform?.isUnloading) return 1;
          if (!a.station?.platform?.isUnloading && b.station?.platform?.isUnloading) return -1;
          return 0;
        });

      const from = stopsUnloadLast[0].stationId.split("_").pop();
      const to = stopsUnloadLast[1].stationId.split("_").pop();

      dot += `  "${from}" -> "${to}" [label="${stopsUnloadLast[1].station?.name.substring(1).split('[').slice(1).join('[')}]"]\n`;
    }
  }

  dot += '}\n';
  fs.writeFileSync(outputPath, dot, 'utf-8');
}

async function main() {
  // Update the path to your actual save file location if needed
  const filePath = "C:\\Users\\jjb3n\\Downloads\\Gimmie S.A.M.!_autosave_0 (10).sav";
  const buffer = readFileSync(filePath);

  try {
    const stations = await getStationsFromSave(buffer);

    //console.log(stationWithPosition);
    //console.log(stations.trains);
    //console.log(stations.droneStations.map(station => ({ type: 'drone', name: station.properties.mBuildingTag?.value, x: station.transform.translation.x, y: station.transform.translation.y })));
    //console.log(stations.truckStations.map(station => ({ type: 'truck', name: station.properties.mBuildingTag?.value, x: station.transform.translation.x, y: station.transform.translation.y  })));
    //console.log(stations.other.map(station => ({ type: 'other', name: station, x:station.transform.translation.x, y: station.transform.translation.y })));

    writeRawTrainStationsToJson(Array.from(stations.trainStations.values()), "trainStations.json");
    writeRawTrainStationsToJson(stations.trains, "trains.json");
    writeRawTrainStationsToJson(stations.other, "other.json");

    writeTrainGraphToDot(stations.trainStations, stations.trains, "train_network.dot");

    if (Array.from(stations.trainStations.values()).length <= 0 && stations.droneStations?.length <= 0 && stations.truckStations?.length <= 0) {
      console.log("No stations found in the save file.");
    }
  } catch (err) {
    console.error("Error reading stations:", err);
  }
}

main(); 