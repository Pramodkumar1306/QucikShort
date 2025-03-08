import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Shuffle, Info, ChevronLeft, ChevronRight, Settings } from 'lucide-react';

interface ArrayBar {
  value: number;
  state: 'default' | 'pivot' | 'comparing' | 'sorted' | 'active';
}

interface Step {
  array: ArrayBar[];
  pivotIndex: number;
  comparing: number[];
  activeLineNumber: number;
  description: string;
  partitionInfo: string;
}

const INITIAL_ARRAY = [19, 28, 37, 38, 39, 39, 8, 9];
const DEFAULT_ANIMATION_SPEED = 1000;

const QuickSortInfo = {
  title: "Quick Sort Algorithm",
  description: "Quick Sort is a highly efficient, comparison-based sorting algorithm that uses a divide-and-conquer strategy.",
  timeComplexity: {
    average: "O(n log n)",
    worst: "O(n²)",
    best: "O(n log n)"
  },
  spaceComplexity: "O(log n)",
  characteristics: [
    "Uses divide-and-conquer strategy",
    "In-place sorting algorithm",
    "Unstable sorting algorithm",
    "Recursive algorithm"
  ],
  colorGuide: [
    { color: "yellow", meaning: "Pivot Element" },
    { color: "blue", meaning: "Currently Comparing" },
    { color: "light blue", meaning: "Current Partition" },
    { color: "green", meaning: "Sorted Position" }
  ]
};

const QuickSortVisualizer: React.FC = () => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(DEFAULT_ANIMATION_SPEED);
  const [arraySize, setArraySize] = useState(8);

  const generateRandomArray = (size: number = arraySize) => {
    return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
  };

  const generateSteps = (array: number[]) => {
    const steps: Step[] = [];
    const bars: ArrayBar[] = array.map(value => ({ value, state: 'default' }));
    let partitionCount = 0;
    
    steps.push({
      array: [...bars],
      pivotIndex: -1,
      comparing: [],
      activeLineNumber: 1,
      description: 'Starting Quick Sort algorithm',
      partitionInfo: 'Initializing Quick Sort'
    });

    const quickSort = (arr: ArrayBar[], low: number, high: number) => {
      if (low < high) {
        partitionCount++;
        const pivot = arr[high].value;
        let i = low - 1;

        steps.push({
          array: [...arr.map((bar, idx) => ({
            ...bar,
            state: idx === high ? 'pivot' : 
                   idx >= low && idx <= high ? 'active' : 'default'
          }))],
          pivotIndex: high,
          comparing: [],
          activeLineNumber: 2,
          description: `Working with partition [${low} to ${high}]`,
          partitionInfo: `Working on partition [${low} to ${high}]. Since partition size == ${high - low + 1}, elements inside partition will be sorted.`
        });

        for (let j = low; j < high; j++) {
          steps.push({
            array: [...arr.map((bar, idx) => ({
              ...bar,
              state: idx === high ? 'pivot' : 
                    idx === j ? 'comparing' :
                    idx >= low && idx <= high ? 'active' : 'default'
            }))],
            pivotIndex: high,
            comparing: [j],
            activeLineNumber: 3,
            description: `Comparing ${arr[j].value} with pivot ${pivot}`,
            partitionInfo: `Comparing elements in partition [${low} to ${high}]`
          });

          if (arr[j].value <= pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
            
            steps.push({
              array: [...arr],
              pivotIndex: high,
              comparing: [i, j],
              activeLineNumber: 4,
              description: `Swapped ${arr[i].value} and ${arr[j].value}`,
              partitionInfo: `Swapping elements to maintain partition order`
            });
          }
        }

        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        
        steps.push({
          array: [...arr],
          pivotIndex: i + 1,
          comparing: [],
          activeLineNumber: 5,
          description: `Placed pivot ${pivot} at position ${i + 1}`,
          partitionInfo: `Partition ${partitionCount} complete`
        });

        quickSort(arr, low, i);
        quickSort(arr, i + 2, high);
      }
    };

    const arrayBars = [...bars];
    quickSort(arrayBars, 0, arrayBars.length - 1);
    
    steps.push({
      array: arrayBars.map(bar => ({ ...bar, state: 'sorted' })),
      pivotIndex: -1,
      comparing: [],
      activeLineNumber: 6,
      description: 'Array is now sorted!',
      partitionInfo: `Quick Sort complete after ${partitionCount} partitions`
    });

    return steps;
  };

  useEffect(() => {
    setSteps(generateSteps(INITIAL_ARRAY));
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentStepIndex < steps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, animationSpeed);
    } else if (currentStepIndex >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, steps.length, animationSpeed]);

  const currentStep = steps[currentStepIndex] || steps[0];

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const handleRandomize = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    const newArray = generateRandomArray();
    setSteps(generateSteps(newArray));
  };

  const handleStepForward = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setIsPlaying(false);
    }
  };

  const handleStepBackward = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setIsPlaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Quick Sort Visualization</h1>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200 transition-colors"
          >
            <Info size={24} />
          </button>
        </div>

        {showInfo && (
          <div className="mb-8 bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">{QuickSortInfo.title}</h2>
            <p className="mb-4">{QuickSortInfo.description}</p>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Time Complexity</h3>
                <ul className="list-disc list-inside">
                  <li>Average: {QuickSortInfo.timeComplexity.average}</li>
                  <li>Worst: {QuickSortInfo.timeComplexity.worst}</li>
                  <li>Best: {QuickSortInfo.timeComplexity.best}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Key Characteristics</h3>
                <ul className="list-disc list-inside">
                  {QuickSortInfo.characteristics.map((char, idx) => (
                    <li key={idx}>{char}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-8">
          {/* Array Visualization */}
          <div className="flex-1">
            <div className="h-64 flex items-end justify-center gap-2">
              {currentStep?.array.map((bar, idx) => (
                <div
                  key={idx}
                  className={`w-16 flex flex-col items-center transition-all duration-300
                    ${bar.state === 'pivot' ? 'bg-yellow-500' :
                      bar.state === 'comparing' ? 'bg-blue-400' :
                      bar.state === 'sorted' ? 'bg-green-500' :
                      bar.state === 'active' ? 'bg-blue-200' : 'bg-gray-300'}`}
                  style={{ height: `${(bar.value / 100) * 100}%` }}
                >
                  <span className="text-sm font-medium mb-2">{bar.value}</span>
                  {/* <span className="absolute -bottom-5">{idx}</span> */}
                </div>
              ))}
            </div>
          </div>

          {/* Code and Info */}
          <div className="flex-1">
            <div className="bg-green-100 p-4 rounded-lg mb-4">
              <p className="text-sm">{currentStep?.partitionInfo}</p>
            </div>
            
            <pre className="bg-black text-white p-4 rounded-lg text-sm">
              {`for each (unsorted) partition
  set first element as pivot
  storeIndex = pivotIndex+1
  for i = pivotIndex+1 to rightmostIndex
    if ((a[i] < a[pivot]) or (equal but 50% lucky))
      swap(i, storeIndex); ++storeIndex
  swap(pivot, storeIndex-1)`.split('\n').map((line, idx) => (
                <div
                  key={idx}
                  className={`${idx + 1 === currentStep?.activeLineNumber ? 
                    'bg-pink-500 bg-opacity-40' : ''} py-1`}
                >
                  {line}
                </div>
              ))}
            </pre>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Speed:</label>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                className="w-32"
              />
              <span className="text-sm">{animationSpeed}ms</span>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Array Size:</label>
              <select
                value={arraySize}
                onChange={(e) => {
                  const newSize = Number(e.target.value);
                  setArraySize(newSize);
                  setSteps(generateSteps(generateRandomArray(newSize)));
                }}
                className="border rounded px-2 py-1"
              >
                {[4, 6, 8, 10, 12].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-lg mb-4 text-center">{currentStep?.description}</p>
          
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={handleStepBackward}
              disabled={currentStepIndex === 0}
              className="bg-gray-500 text-white px-3 py-2 rounded-lg disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            
            <button
              onClick={handlePlayPause}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            
            <button
              onClick={handleReset}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <RotateCcw size={20} />
              Reset
            </button>
            
            <button
              onClick={handleRandomize}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Shuffle size={20} />
              New Array
            </button>
            
            <button
              onClick={handleStepForward}
              disabled={currentStepIndex === steps.length - 1}
              className="bg-gray-500 text-white px-3 py-2 rounded-lg disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="mt-6 flex justify-center gap-4">
            {QuickSortInfo.colorGuide.map((guide, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${
                  guide.color === 'yellow' ? 'bg-yellow-500' :
                  guide.color === 'blue' ? 'bg-blue-400' :
                  guide.color === 'light blue' ? 'bg-blue-200' :
                  'bg-green-500'
                }`} />
                <span className="text-sm">{guide.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSortVisualizer;