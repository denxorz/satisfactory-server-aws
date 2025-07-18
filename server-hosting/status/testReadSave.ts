import { readFileSync } from "fs";
import { getStationsFromSave } from "./readSave";

function writeRawTrainStationsToJson(stations: any, outputPath: string) {
  const fs = require('fs');
  fs.writeFileSync(outputPath, JSON.stringify(stations, null, 2), 'utf-8');
}

function writeTrainGraphToDot(stations: any[], trains: any[], outputPath: string) {
  const fs = require('fs');
  let dot = 'digraph TrainNetwork {\n';
  dot += '  node [shape=rectangle];\n  overlap=false\n  splines=curved\n';

  // Find min/max for scaling
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const station of stations) {
    if (typeof station.x === 'number' && typeof station.y === 'number') {
      if (station.x < minX) minX = station.x;
      if (station.x > maxX) maxX = station.x;
      if (station.y < minY) minY = station.y;
      if (station.y > maxY) maxY = station.y;
    }
  }
  const width = maxX - minX;
  const height = maxY - minY;
  const scale = Math.min(30 / width, 30 / height);

  // Add nodes with scaled position and label
  for (const station of stations) {
    if (typeof station.x === 'number' && typeof station.y === 'number') {
      const scaledX = Math.round((station.x - minX) * scale);
      const scaledY = 30 - (Math.round((station.y - minY) * scale));
      dot += `  "${station.instanceName.split("_").pop()}" [label="${station.name}", pos="${scaledX},${scaledY}!"]\n`;
    } else {
      dot += `  "${station.instanceName.split("_").pop()}" [label="${station.name}"]\n`;
    }
  }

  // Add edges for each train's route
  for (const train of trains) {
    if (train.stops && train.stops.length > 1) {
      const from = train.stops[0].name.split("_").pop();
      const to = train.stops[1].name.split("_").pop();

      if (train.stops[0].unload) {
        dot += `  "${to}" -> "${from}"\n`;
      }
      else {
        dot += `  "${from}" -> "${to}"\n`;
      }
    }
  }

  dot += '}\n';
  fs.writeFileSync(outputPath, dot, 'utf-8');
}

async function main() {
  // Update the path to your actual save file location if needed
  const filePath = "C:\\Users\\jjb3n\\Downloads\\Gimmie S.A.M.!_autosave_1 (3).sav";
  const buffer = readFileSync(filePath);


  try {
    const stations = await getStationsFromSave(buffer);
    const trainStationsBuildableById = stations.trainStationsBuilds.reduce((map, obj) => (map[obj.instanceName] = obj, map), {});

    const stationWithPosition = stations.trainStations.map(station => ({
      instanceName: station.instanceName,
      name: station.name,
      x: trainStationsBuildableById[station.stationPathName]?.x,
      y: trainStationsBuildableById[station.stationPathName]?.y
    }));
    //console.log(stationWithPosition);
    //console.log(stations.trains);
    //console.log(stations.droneStations.map(station => ({ type: 'drone', name: station.properties.mBuildingTag?.value, x: station.transform.translation.x, y: station.transform.translation.y })));
    //console.log(stations.truckStations.map(station => ({ type: 'truck', name: station.properties.mBuildingTag?.value, x: station.transform.translation.x, y: station.transform.translation.y  })));
    //console.log(stations.other.map(station => ({ type: 'other', name: station, x:station.transform.translation.x, y: station.transform.translation.y })));

    //writeRawTrainStationsToJson(stations.truckStations, "truckstations.json");
    writeRawTrainStationsToJson(stations.trains, "trains.json");
    writeTrainGraphToDot(stationWithPosition, stations.trains, "train_network.dot");

    if (stations.trainStations?.length <= 0 && stations.droneStations?.length <= 0 && stations.truckStations?.length <= 0) {
      console.log("No stations found in the save file.");
    }
  } catch (err) {
    console.error("Error reading stations:", err);
  }
}

main(); 