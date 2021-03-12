# survive-the-neat
Neural Networks learn to play a co-op survival zombie game using NEAT.

See for yourself: https://bcook85.github.io/survive-the-neat/game.html

# Simulation Info
This simulation attempts to "evolve" a population of neural networks to learn to play a simple co-op zombie game. Each generation, a new map is randomly generated. Each "brain group" in the population is given a chance to play the game. The players are scored based on how they performed. Once all groups in the generation have been scored, a new generation is created from the current generation, favoring higher scoring brains.
As the user, you can modify a plethora of variables to control each player's vision, scoring, and NEAT values. Modifying these values can have a large impact and many interesting behaviors can emerge.