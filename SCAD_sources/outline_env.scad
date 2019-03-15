// parameters for trees
sizeFactor = 1.1;
gamma = 30;
chungus = 8;
k = 4;
smallN=5;
maxLen = 11;
lowR = 0.8;
upR = 1.2;
killRatio = 1.7; // number of branches killed per surviving branch - needs to be < 3 to probabilistically allow for full tree

//main();
//boatHouses(brick=false, slate=false, greenpaint=false, redpaint=false, whitepaint=true);
//main();
bridge();

module boatHouses(brick=true, slate=true, greenpaint=true, redpaint=true, whitepaint=true){
    translate([28,80.5,1]){
        rotate([0,0,-15]) 
        boatHouse1(brick, slate, redpaint);
        }
    translate([50,75,1]){
        rotate([0,0,-10]) 
        scale([0.97,0.9,1])
        boatHouse2(brick, slate, greenpaint);
        }
    translate([42,34.9,1]){
        rotate([0,0,-15]) 
        scale([0.97,0.9,1.2])
        boatHouse3(brick, slate, greenpaint);
        }
    translate([30,44.7,1]){
        rotate([0,0,-93]) 
        scale([0.4,0.9,2])
        boatHouse4(whitepaint, slate);
        }
    }
    
    
module boatHouse1(brick, slate, door){
    if(brick) {color("pink") walls();}
    if(slate) {color("black") roof();}
    if(door){color("red") doors();}
    }
    
    
module boatHouse2(brick, slate, door){
    if(brick) {color("pink") walls();}
    if(brick) {color("pink") roof();}
    if(door){color("green") doors();}
    }
    
    
module boatHouse3(brick, slate, door){
    if(brick) {color("pink") walls();}
    if(slate) {color("black") roof();}
    if(door){color("green") doors();}
    }
    
module boatHouse4(whitepaint, slate){
    if(whitepaint) {color("white") walls();}
    translate([0,0,1])
    scale([1,1,0.5])
    if(slate) {color("black") roof();}
    }

    

module doors(){
    translate([-.1, 1.5, .05])
    cube([1,2,1.8]);
    translate([14.1, 1.5, .05])
    cube([1,2,1.8]);
    
    }

module walls(){
    cube([15,5,2]);
    }

module roof(){
    translate([15.5,2.58,2.8])
    rotate([0,-90,0])
    scale([.5,1,1])
    cylinder(r=3.4, h=16, $fn=3);
    }

    
module main(){
    boatHouses();
    posdbridge();
    

    river();
    paved();
    riverBank();
    westSlope(); 
    eastSlope();
    boat();
    }
    
 module posdbridge(){
    color("gray")
    translate([136, 18, 0])
    rotate([0,0,15])
    bridge();
}

module bridge(){
    difference(){
    union(){
        cube([4, 80, 5.2]);
        // mark river start
        //translate([0,16,0]) cube([1,1,10]);
        // mark river end
        //translate([0,52,0]) cube([1,1,10]);
        pillar(15);
        pillar(27);
        pillar(39);
        pillar(51);
        fence();
        }
    // arches
    translate([-3,22, 0])    rotate([0,90,0])    cylinder(r=5, h = 10, $fn=50);
    translate([-3,34, 0])    rotate([0,90,0])    cylinder(r=5, h = 10, $fn=50);
    translate([-3,46, 0])    rotate([0,90,0])    cylinder(r=5, h = 10, $fn=50);
        innerPillar(15);
        innerPillar(27);
        innerPillar(39);
        innerPillar(51);
    }
}

module fence(){
    difference(){
        union(){
            translate([0,0,5.2]) cube([0.5,80,1]);
            translate([3.5,0,5.2]) cube([0.5,80,1]);
        }
    for(k=[0, 3.5]){
    for(j=[22, 34, 46]){
    for(i=[j-2:0.4:j+2]){
        translate([k-.5,i,5.4]) cube([2, .2, .6]);
        }
    }}

    }}

module innerPillar(x){
        translate([0.5,x,0]) 
        scale([1.6,0.707,1])
        rotate([0,0,45])
        cube([2,2,6.2]);
    translate([3.5,x,0]) 
        scale([1.6,0.707,1])
        rotate([0,0,45])
        cube([2,2,6.2]);
    
    }

module pillar(x){
    
    translate([0,x,0]) 
        scale([1.6,0.707,1])
        rotate([0,0,45])
        cube([2,2,6.2]);
    translate([4,x,0]) 
        scale([1.6,0.707,1])
        rotate([0,0,45])
        cube([2,2,6.2]);
    }
    
module trees(branches = true, leaves=true, seed=0){
    eastCenterTrees(n=smallN*2, , branches=branches, leaves=leaves, scale=0.3, seed=seed);
    eastNorthTrees(n=smallN*3, , branches=branches, leaves=leaves, scale=0.3, seed=seed);
    westTrees(n=(5*smallN), , branches=branches, leaves=leaves, scale=0.3, seed=seed);
    }
   
    
module westTrees(n, branches = true, leaves = true, scale=1, seed=0){
    xs = rands(0,160,n, 58+seed);
    ys = rands(10,30,n, 95+seed);
    // calculate/approximate z
    for (i=[0:n]){
        tree(xs[i], ys[i], 9+(-1*ys[i])/3, branches, leaves, scale, seed=0);
        }
    }
    
module eastCenterTrees(n, branches=true, leaves=true, scale=1, seed=0){
    xs = rands(80,120,n, 327+seed);
    ys = rands(70,90,n, 167+seed);
    // calculate/approximate z
    for (i=[0:n]){
        tree(xs[i], ys[i], -37+(5.9*ys[i])/11, branches, leaves, scale, seed=0);
        }
}

module eastNorthTrees(n, branches=true, leaves=true, scale=1, seed=0){
    xs = rands(0,80,n, 489+seed);
    ys = rands(85,100,n, 77+seed);
    // calculate/approximate z
    for (i=[0:n]){
        tree(xs[i], ys[i], (0.1*xs[i])-47+(5.9*ys[i])/11, branches, leaves, scale, seed=seed);
        }
}




module tree(xpos, ypos, zpos, branches=true, leaves=true, scale){
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
    linear_extrude(scale=[1.08,1.24], height = 10, center = false, convexity = 100){
    offset(r=3) 
    import (file = "slopeEastBot.dxf");}
 
    }

module westSlope() {
   rotate([0,0,-150])
    translate([-250, -80, 0])
    color ("green") 
    linear_extrude(scale=[1.15,1.24], height = 10, center = false, convexity = 100){
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
    
    if (i==0){
        color("brown"){
        translate([xRoot, yRoot, zRoot-branchLen])
        rotate([0, beta,0])
        rotate([alpha, 0,0])
        branch(lastLen, branchLen);
        }
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

module boat(){
    translate([100,50,0.9]) color("white")scale(0.3){
    difference(){
        translate([0,0,0.75])
        scale([1,0.5,0.75])
        rotate([0,90,0])
        union(){    
            translate([0,0,10])
            cylinder(r1=1, r2=0, h=6, $fn=50);
            translate([0,0,-6])
            cylinder(r1=0, r2=1, h=6, $fn=50);
            cylinder(r=1, h=10, $fn=50);
            
            }
    translate([-15,-1,0.75])
    cube([50,2,2]);
    }
    // fixtures for oars
    translate([2, -0.75, 0.55])
    rotate([0,0,30])
    scale([2,2,1])
    fixture();
    translate([6, -0.75, 0.55])
    rotate([0,0,30])
    scale([2,2,1])
    fixture();
    translate([4, +0.75, 0.55])
    rotate([0,0,-30])
    scale([2,2,1])
    fixture();
    translate([8, +0.75, 0.55])
    rotate([0,0,-30])
    scale([2,2,1])
    fixture();
    }
    }


    
module fixture(r=2/3, w=0.2){
    difference(){
    cylinder(r=r, h=0.2, $fn=3);
    cylinder(r=r-w, h=0.2, $fn=3);
    }}

