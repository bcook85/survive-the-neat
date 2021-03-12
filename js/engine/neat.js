/******************************************************************************
Neuron Class, holds a bunch of random numbers
******************************************************************************/
class Neuron {
  constructor(size) {
    this.size = size;
    this.weights = [];
    for (let i = 0; i < size; i++) {
      this.weights.push((Math.random() * 2) - 1);
    }
    this.bias = (Math.random() * 2) - 1;
  };
  calculateSignal(inputs) {
    let sum = 0;
    for (let i = 0; i < this.weights.length; i++) {
      sum += inputs[i] * this.weights[i];
    }
    return sum + this.bias;
  };
};
/******************************************************************************
Layer Class, holds neurons
******************************************************************************/
class Layer {
  constructor(nCount, wCount) {
    this.size = nCount;
    this.neurons = [];
    for (let i = 0; i < nCount; i++) {
      this.neurons.push(new Neuron(wCount));
    }
  };
  feedNeurons(inputs) {
    let output = [];
    for (let i = 0; i < this.neurons.length; i++) {
      output.push(this.neurons[i].calculateSignal(inputs));
    }
    return output;
  };
};
/******************************************************************************
Brain Class, holds layers
******************************************************************************/
class Brain {
  constructor(dimensions) {
    this.dimensions = dimensions;
    this.layers = [];
    this.score = 0;
    for (let i = 1; i < dimensions.length; i++) {
      this.layers.push(new Layer(dimensions[i], dimensions[i - 1]));
    }
  };
  static sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  };
  static rectifiedLinear(x) {
    return x <= 0 ? 0 : x;
  };
  feedForward(inputs) {
    for (let i = 0; i < this.layers.length; i++) {
      inputs = this.layers[i].feedNeurons(inputs);
      for (let j = 0; j < inputs.length; j++) {
        if (i < this.layers.length - 1) {
          inputs[j] = Brain.rectifiedLinear(inputs[j]);
        } else {
          inputs[j] = Brain.sigmoid(inputs[j]);
        }
        // inputs[j] = Brain.rectifiedLinear(inputs[j]);
      }
    }
    return inputs;
  };
};
/******************************************************************************
NEAT Class, holds brains, does stuff to them
******************************************************************************/
class Neat {
  constructor(populationSize, dimensions) {
    this.populationSize = populationSize;
    this.mutationChance = 0.01;
    this.mutationAmount = 0.01;
    this.mutationCritical = 0.000000001;
    this.generation = 0;
    this.pickTop1 = 0.2;
    this.pickTop2 = 0.5;
    this.brains = [];
    for (let i = 0; i < populationSize; i++) {
      this.brains.push(new Brain(dimensions));
    }
  };
  processInput(brainID, input) {
    if (brainID < 0 || brainID >= this.brains.length
      || input.length !== this.brains[brainID].dimensions[0])
    {
      return undefined;
    }
    return this.brains[brainID].feedForward(input);
  };
  nextGeneration() {
    this.brains.sort((a, b) => b.score - a.score);
    let newBrains = [];
    for (let i = 0; i < this.brains.length; i++) {
      let first = this.pickTop(this.pickTop1);
      let second = this.pickTop(this.pickTop2);
      while (second == first) {
        second = this.pickTop(this.pickTop2);
      }
      let newBrain = this.crossover(this.brains[first], this.brains[second]);
      this.mutateBrain(newBrain);
      newBrains.push(newBrain);
    }
    this.brains = newBrains;
    this.generation += 1;
  };
  pickTop(percent) {
    return Math.floor(
      Math.random() * Math.floor(this.populationSize * percent)
      );
  };
  crossover(brain1, brain2) {
    let newBrain = new Brain(brain1.dimensions);
    for (let i = 0; i < newBrain.layers.length; i++) {
      for (let j = 0; j < newBrain.layers[i].neurons.length; j++) {
        for (let k = 0; k < newBrain.layers[i].neurons[j].weights.length; k++) {
          newBrain.layers[i].neurons[j].weights[k] = brain1.layers[i].neurons[j].weights[k];
          if (Math.random() < 0.5) {
            newBrain.layers[i].neurons[j].weights[k] = brain2.layers[i].neurons[j].weights[k];
          }
        }
        newBrain.layers[i].neurons[j].bias = brain1.layers[i].neurons[j].bias;
        if (Math.random() < 0.5) {
          newBrain.layers[i].neurons[j].bias = brain2.layers[i].neurons[j].bias;
        }
      }
    }
    return newBrain;
  };
  mutateBrain(brain) {
    for (let i = 0; i < brain.layers.length; i++) {
      for (let j = 0; j < brain.layers[i].neurons.length; j++) {
        // Weights
        for (let k = 0; k < brain.layers[i].neurons[j].weights.length; k++) {
          this.mutateValue(brain.layers[i].neurons[j].weights[k]);
        }
        // bias
        this.mutateValue(brain.layers[i].neurons[j].bias);
      }
    }
  };
  mutateValue(value) {
    if (Math.random() < this.mutationCritical) {
      value = (Math.random() * 2) - 1;
    } else if (Math.random() <= this.mutationChance) {
      if (Math.random() < 0.5) {
        value += this.mutationAmount;
        if (value > 1) {
          value = 1;
        }
      } else {
        value -= this.mutationAmount;
        if (value < -1) {
          value = -1;
        }
      }
    }
  };
};
