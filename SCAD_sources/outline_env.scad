// parameters for trees
sizeFactor = 1.1;
gamma = 30;
chungus = 8;
k = 4;
maxLen = 10;
lowR = 0.8;
upR = 1.2;
killRatio = 2; // number of branches killed per surviving branch - needs to be < 3 to probabilistically allow for full tree

main();


module trees(branches = true, leaves=true){
    eastCenterTrees(n=30, scale=0.3);
    eastNorthTrees(n=30, scale=0.3);
    westTrees(n=100, scale=0.3);
    }
    
module main(){
    trees();
    river();
    paved();
    riverBank();
        westSlope(); 
        eastSlope();
    }
    
    
module westTrees(n, branches = true, leaves = true, scale=1){
    xs = rands(0,200,n, 123048);
    ys = rands(-40,35,n, 1328074);
    // calculate/approximate z
    for (i=[0:n]){
        tree(xs[i], ys[i], 12+(-12*ys[i])/40, branches, leaves, scale);
        }
    }
    
module eastCenterTrees(n, branches=true, leaves=true, scale=1){
    xs = rands(80,120,n, 12435);
    ys = rands(80,135,n, 167);
    // calculate/approximate z
    for (i=[0:n]){
        tree(xs[i], ys[i], -39+(5.9*ys[i])/11, branches, leaves, scale);
        }
}

module eastNorthTrees(n, branches=true, leaves=true, scale=1){
    xs = rands(0,80,n, 4589);
    ys = rands(90,135,n, 677);
    // calculate/approximate z
    for (i=[0:n]){
        tree(xs[i], ys[i], (xs[i]*0.1)-50+(5.9*ys[i])/11, branches, leaves, scale);
        }
}




module tree(xpos, ypos, zpos, leaves=true, branches=true, scale){
    // "unique" within 
    randFactors = rands(lowR, upR, 500, (xpos+ypos)%zpos);
    randProbs = rands(0, killRatio, 500, (xpos+zpos)/ypos);
    translate([xpos, ypos, zpos])
    scale([scale,scale,scale])
    twisty(k, leaves = leaves, branches = branches, randFactors=randFactors, randProbs=randProbs);
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
        //leaf(i+1, xRoot+xShift, yRoot-yShift, zRoot+zShift, alpha+alphaShift,  beta + betaShift);
        leaf(i+1, xRoot+xShift, yRoot-yShift, zRoot+zShift, alpha+alphaShift,  beta - betaShift);
        leaf(i+1, xRoot+xShift, yRoot-yShift, zRoot+zShift, alpha-alphaShift,  beta + betaShift);
        //leaf(i+1, xRoot+xShift, yRoot-yShift, zRoot+zShift, alpha-alphaShift,  beta - betaShift);
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
        rotate([alphaX,-45,beta])
        scale([size, size/20, size])
        cylinder(r1=0, r2=1, h=2);

        }
    }
}

module branch(lastx, nowx, fn=3){    
    cylinder(h=nowx, r1=lastx/chungus, r2=nowx/(chungus), $fn=fn);
}


