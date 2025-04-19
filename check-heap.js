const v8 = require('v8');
const os = require('os');
const { execSync } = require('child_process');

// Get detailed memory info from vm_stat
function getDetailedMemoryInfo() {
  try {
    const vmStat = execSync('vm_stat').toString();
    const pages = vmStat.match(/page size of (\d+)/)[1];
    const pageSize = parseInt(pages);

    const stats = {};
    vmStat.split('\n').forEach(line => {
      const match = line.match(/([^:]+):\s+(\d+)/);
      if (match) {
        stats[match[1].trim()] = parseInt(match[2]) * pageSize;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error getting detailed memory info:', error);
    return null;
  }
}

// System Memory Information
console.log('System Memory Information:');
console.log('-------------------------');
console.log(`Total System Memory: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)} GB`);
console.log(`Free System Memory: ${Math.round(os.freemem() / 1024 / 1024 / 1024)} GB`);
console.log(
  `Used System Memory: ${Math.round((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024)} GB`
);

// Detailed Memory Information
const detailedMem = getDetailedMemoryInfo();
if (detailedMem) {
  console.log('\nDetailed Memory Information:');
  console.log('---------------------------');
  console.log(`Active Memory: ${Math.round(detailedMem['Pages active'] / 1024 / 1024 / 1024)} GB`);
  console.log(
    `Inactive Memory: ${Math.round(detailedMem['Pages inactive'] / 1024 / 1024 / 1024)} GB`
  );
  console.log(
    `Wired Memory: ${Math.round(detailedMem['Pages wired down'] / 1024 / 1024 / 1024)} GB`
  );
  console.log(
    `Compressed Memory: ${Math.round(detailedMem['Pages occupied by compressor'] / 1024 / 1024 / 1024)} GB`
  );
  console.log(
    `File Cache: ${Math.round(detailedMem['File-backed pages'] / 1024 / 1024 / 1024)} GB`
  );
}

console.log('\nNode.js Heap Statistics:');
console.log('----------------------');
const heapStats = v8.getHeapStatistics();
console.log(`Total Heap Size: ${Math.round(heapStats.total_heap_size / 1024 / 1024)} MB`);
console.log(
  `Total Heap Size Executable: ${Math.round(heapStats.total_heap_size_executable / 1024 / 1024)} MB`
);
console.log(`Total Physical Size: ${Math.round(heapStats.total_physical_size / 1024 / 1024)} MB`);
console.log(`Total Available Size: ${Math.round(heapStats.total_available_size / 1024 / 1024)} MB`);
console.log(`Used Heap Size: ${Math.round(heapStats.used_heap_size / 1024 / 1024)} MB`);
console.log(`Heap Size Limit: ${Math.round(heapStats.heap_size_limit / 1024 / 1024)} MB`);
