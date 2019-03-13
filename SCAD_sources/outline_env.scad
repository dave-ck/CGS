// parameters for trees
sizeFactor = 1.1;
gamma = 30;
chungus = 8;
k = 4;
maxLen = 10;
lowR = 0.8;
upR = 1.2;
killRatio = 1.5; // number of branches killed per surviving branch - needs to be < 3 to probabilistically allow for full tree

module trees(branches = true, leaves = true){
    // west
    tree(0, 50, 50, branches, leaves, scale=1);

}

module tree(xpos, ypos, zpos, leaves=true, branches=true, scale=1){
    // "unique" within 
    randFactors = rands(lowR, upR, 500, (xpos+ypos)%zpos);
    randProbs = rands(0, killRatio, 500, (xpos+zpos)/ypos);
    translate([xpos, ypos, zpos])
    scale([scale,scale,scale])
    twisty(3, leaves = leaves, branches = branches, randFactors=randFactors, randProbs=randProbs);
    }


//color("green") cube([200,200,1]);

main();

module main(){
    trees();
    river();
    paved();
    riverBank();
        westSlope(); 
        eastSlope();
    }
    
module river(){
    color ("blue") linear_extrude(height = 1, center = false, convexity = 10)
    import (file = "river_outline.dxf");
    }
    
module paved() {
    translate([0, 0, 0.1]){
    color ("black") linear_extrude(height = 1, center = false, convexity = 10)
    import (file = "pavedEast.dxf");
    color ("black") linear_extrude(height = 1, center = false, convexity = 10)
    import (file = "pavedWest.dxf");}}
    
module riverBank() {
    translate([0,0, 0.05]) // above water, below pavement
    color ("green") linear_extrude(height = 1, center = false, convexity = 10)
    import (file = "riverBank.dxf");
        }

module eastSlope() {
    color ("green") 
    linear_extrude(scale=[1.2,1.8], height = 30, center = false, convexity = 100){
    offset(r=3) 
    import (file = "slopeEastBot.dxf");}
 
    }

module westSlope() {
   rotate([0,0,-150])
    translate([-250, -80, 0])
    color ("green") 
    linear_extrude(scale=[1.5,1.8], height = 30, center = false, convexity = 100){
    translate([250,80,0])
    rotate([0,0,150])
    offset(r=3) 
    import (file = "slopeWestBot.dxf");}
 
    }

module twisty(levels, lastLen=maxLen, i=0, xRoot = 0, yRoot = 0, zRoot=0, alpha=0, beta=0, randi=0, leaves = true, branches = true, randFactors=false, randProbs=false){
    branchLen = (lastLen/sizeFactor) * randFactors[randi] / upR; //ensure not greater than lastLen      
    xShift =  cos(alpha) * sin(beta) * branchLen;
    yShift = sin(alpha) * branchLen;
    zShift = cos(alpha) * cos(beta) * branchLen;
    // choose alpha, beta shifts at random
    alphaShift = gamma * randFactors[randi+1];
    betaShift = gamma * randFactors[randi+2];
    randi = randi + 3;
 	childless = true;
    if (i<levels){
    // with some probability, don't do each/any of these
        if(randProbs[randi] < 1){
			twisty(levels, branchLen, i+1, xRoot+xShift, yRoot-yShift, zRoot+zShift, alpha+alphaShift, beta + betaShift, (randi*67)%401, leaves, branches, randFactors, randProbs);
			childless = false;
		}
        if(randProbs[randi+1] < 1){
			twisty(levels, branchLen, i+1, xRoot+xShift, yRoot-yShift, zRoot+zShift, alpha+alphaShift, beta - betaShift, (randi*61)%281, leaves, branches, randFactors, randProbs);
			childless = false;
		}
        if(randProbs[randi+2] < 1){
			twisty(levels, branchLen, i+1, xRoot+xShift, yRoot-yShift, zRoot+zShift, alpha-alphaShift, beta + betaShift, (randi*29)%439, leaves, branches, randFactors, randProbs);
			childless = false;
		}
		if(randProbs[randi+3] < 1){
			twisty(levels, branchLen, i+1, xRoot+xShift, yRoot-yShift, zRoot+zShift, alpha-alphaShift, beta - betaShift, (randi*13)%419, leaves, branches, randFactors, randProbs);
			childless = false;
		}
        }
    if (leaves && childless && i>1){  // draw a leaf at the end of each branch drawn below
        leaf(i+1, xRoot+xShift, yRoot-yShift, zRoot+zShift, alpha+alphaShift,  beta + betaShift);
        leaf(i+1, xRoot+xShift, yRoot-yShift, zRoot+zShift, alpha+alphaShift,  beta - betaShift);
        leaf(i+1, xRoot+xShift, yRoot-yShift, zRoot+zShift, alpha-alphaShift,  beta + betaShift);
        leaf(i+1, xRoot+xShift, yRoot-yShift, zRoot+zShift, alpha-alphaShift,  beta - betaShift);
        }
	if (branches){
		color("brown"){
        translate([xRoot, yRoot, zRoot])
        rotate([0, beta,0])
        rotate([alpha, 0,0])
        branch(lastLen, branchLen);
        }
    }
}




module leaf(levels, x=0, y=0, z=0, alphaX=0, beta=0){
    color("green"){
        size = maxLen/pow(sizeFactor, levels)/3;
        translate([x,y,z]){
        rotate([0,-45 -alphaX,beta])
        cube([size,size/20,size]);
        rotate([0,-45 + alphaX,beta])
        cube([size,size/20,size]);
        }
    }
}

module branch(lastx, nowx, fn=3){    
    cylinder(h=nowx, r1=lastx/chungus, r2=nowx/(chungus), $fn=fn);
}


