To run: 
In the root directory "cgs-master", in command line:
- npm install express
- node index.js
Wait for the text "Ready to .get()." to appear.
Navigate to "localhost:8080" in a browser (tested with Firefox and Chrome), and allow up to 15 seconds for models to be loaded in.


Description:

Prebend's bridge and the surrounding area. Trees are pairwise unique, as are the boat houses. Overall object was achieved by tracing a DXF cutout of each object (river,
 path, river bank...) and extruding the resulting 2D shape in OpenSCAD to obtain a "base" on which to build more detailed objects (such as the trees).

Rowing boat with oars moving synchronously and sinusoidally; note that the oars remain fixed to the boat where they would normally be, turn their blades to be vertical
 when they dip them into the water, and turn them back to be horizontal when they are bringing them forwards above the water.

Components were modelled in OpenSCAD (quite low level modelling language and syntactically intuitive, feel free to take a look at the attached source .scad files)
 then rendered to STL. stlScanner.js was used to read said STL files into a more easily loadable JSON file (models.json).

Components were rendered/loaded separately to allow for easy coloring of the entire model (done once exactly in the main program, immediately before the first render),
 and to allow for movement (i.e. the row boat). 
