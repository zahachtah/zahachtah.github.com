---
layout: post
title: Neuroscience
category: programming
tags: [github, github-pages, jekyll]
---

## An attempt to get to grips with nupics HTM implementation using Julia 

```javascript
Network: 
has several regions
```

```javascript
Region: 
name
nodeType
nodeParams
Network
```

```javascript
ChalmersHTM: 
numInputBits
numColumns
numCells
permDec
maxSyn

SpatialPooler
TemporalPooler

*activeColumns
```

```javascript
**structures**: 
synapse(permanence,sourceInput)
syn(permanence, column_index, cell_index)
synapseUpdate(permanence, column_index, cell_index,synapse_index)
segmentUpdate(segIndex,sequenceSegment, *activeSynapses)
segment(activity, sequenceSegment, num_active_synapses, *potentialSynapses, *connectedSynapses)
cell(predictSegmentIndex, *predictiveState, *learnState, *activeState, *segment)
column(*overlap, boost, activeDutyCycle, minDutyCycle, lastLearnCell, *potentialSynapses, *connectedSynapses, *neighbors)
**constants**: 
iterations, minOverlap, connectedPerm, permanenceInc, desiredLocalActivity, inhibitionRadius, cellsPerColumn, activationThreshold, minThreshold, maxSynapseCount, initialPerm, state {activeState , learnState }, *mInput, segmentUpdateList)
```

![neurons](https://dl.dropboxusercontent.com/u/38371278/sparseHTM.jpg)

Phrases to examine:

Neuron dynamics in the NeoCortix:

![numenta neurons](https://dl.dropboxusercontent.com/u/38371278/HTMneuron.jpg)

![Neuron](http://www.helcohi.com/sse/images/body/1-4ci.gif)

Also, check out this important science result about [splitting the column](http://www.neuwritewest.org/blog/4167?rq=splitting)

### Dendrites

The proximal dendrite segment receives feed-foorward input and the distal dendrite segments receive receive lateral input from nearby cells.

A class of inhibitory cells forces all the cells in a column to respond to similar feed-forward input

To simplify, we removed the proximal dendrite segment from each cell and replaced it with a single shared dendrite segment per column of cells. This simplification achieves the same functionality, though in biology there is no equivalent to a dendrite segment attached to a column.

The spatial pooler function operates on the shared dendrite segment, at the level of columns.

The temporal pooler function operates on the distal dendrite segments, at the level of the individual cells within the column.

[dendrite branching paper](http://www.frontiersin.org/Journal/10.3389/fnana.2011.00005/full)

![dendrite branching pattern](http://c431376.r76.cf2.rackcdn.com/8471/fnana-05-00005-HTML/image_m/fnana-05-00005-g006.jpg)

### Synapses

Interstin article [coincidence detection](http://en.wikipedia.org/wiki/Coincidence_detection_in_neurobiology)

HTM synapses have binary weights. Biological synapses have varying wheights, but they are also stochastic, suggesting a biologial neuron cannot rely on precice synaptic wheights.

Potential synapses: These are synapses that are "close enough" to potentially have a synapse connection. 

permanence: A scalar value that represents learning, when permanence is higher than a threshold value, the synapse binary connection goes "on"

[PLOS article](http://www.ploscompbiol.org/article/info%3Adoi%2F10.1371%2Fjournal.pcbi.1002599)

![Dist/prox](http://www.ploscompbiol.org/article/fetchObject.action?uri=info:doi/10.1371/journal.pcbi.1002599.g004&representation=PNG_I)

[Nature article](http://www.nature.com/nrn/journal/v9/n3/box/nrn2286_BX2.html)

![Synapse Model](http://www.nature.com/nrn/journal/v9/n3/images/nrn2286-i2.jpg)

A synapse does in general produce 0.2-0.3 mV if triggered close to the body.


How about electrical vs chemical synapses?

neurotransmittor response. glutamate is positive, gaba may be negative

synapse doctrine: synapsis is the basis for memory and learning

synaptic plasticity depends on spiking timing.: if A fires before B then synaps strrengthes (LTP), if B fires before A then you get inhibation (LTD)

![Spike timing from courser course](https://dl.dropboxusercontent.com/u/38371278/SpikeTiming.jpg)

looks like hypertangent

Interestingly, synapses can emmit multiple neurotransmittors

from [neuroscience](http://www.ncbi.nlm.nih.gov/books/NBK10818/)

![multiemmition](http://www.ncbi.nlm.nih.gov/books/NBK10818/bin/ch6f5.jpg)

### Firing

From Coursera

r(t)=g(\int{s(t-\tau) f({tau) d\tau)

f(x) is a filter like a neural firing response
s(x) is the input signal)
g(x) is a nonlinear function similar to logistic such that small and negative values goe to zero and high values go towards one


### Regions

Regions contain a set of columns, these can be logically arranged in a 2D array but this is not a requirement (jHTM does leave that open, as columns are stored in a 1D array for speed and spatial arrangement can be provided in a separate Variable)

Each column is connected with a unique subset of the input (overlapping with other columns but never the same).

The columns with the strongest activation inhibit or deactivate columns with weaker activation The inhibation occurs within a radius that can span from very local to the entire region

### spatial pooler: Suggest renaming to Context pooler

All these steps (learning the connections to each column from a subset of the inputs, determining the level of input to each column, and using inhibition to select a sparse set of active columns) is referred to as the “Spatial Pooler”. The term means patterns that are “spatially” similar (meaning they share a large number of active bits) are “pooled” (meaning they are grouped together in a common representation).


If one or more cells in the column are already in the predictive state, only those cells become active. If no cells in the column are in the predictive state, then all the cells become active. You can think of it this way, if an input pattern is expected then the system confirms that expectation by activating only the cells in the predictive state. If the input pattern is unexpected then the system activates all cells in the column as if to say “the input occurred unexpectedly so all possible interpretations are valid”.

column will become active when the column becomes active. This scenario is similar to hearing the first note in a song. Without context you usually can’t predict what will happen next; all options are available. If there is prior state but the input does not match what is expected, all the cells in the active column will become active. This determination is done on a column by column basis so a predictive match or mismatch is never an “all-or-nothing” event.

HTM cells can be in one of three states. If a cell is active due to feed-forward input we just use the term “active”. If the cell is active due to lateral connections to other nearby cells we say it is in the “predictive state” (Figure 2.3).
