sizeFactor = 1.1;
gamma = 18;
chungus = 12;
k = 4;
maxLen = 10;
lowR = 0.8;
upR = 1.2;
killRatio = 2.5; // number of branches killed per surviving branch - needs to be < 3 to probabilistically allow for full tree
for (i = rands(0,200, 4, 923831)){
    for (j = rands(0,200, 4, 12983764+i)){
        randFactors = rands(lowR, upR, 5000, i*j);
        randProbs = rands(0, killRatio, 5000, i*j);
        translate([i*j%200,j,0])
        twisty(3, leaves = true, branches = true, randFactors=randFactors, randProbs=randProbs);
    }

}

color("green") cube([200,200,1]);




module twisty(levels, lastLen=maxLen, i=0, xRoot = 0, yRoot = 0, zRoot=0, alpha=0, beta=0, randi=0, leaves = true, branches = true, randFactors=false, randProbs=false){
    branchLen = (lastLen/sizeFactor) * randFactors[randi] / upR; //ensure not greater than lastLen      
    xShift =  cos(alpha) * sin(beta) * branchLen;
    yShift = sin(alpha) * branchLen;
    zShift = cos(alpha) * cos(beta) * branchLen;
    // choose alpha, beta shifts at random
    alphaShift = gamma * randFactors[randi+1];
    betaShift = gamma * randFactors[randi+2];
    randi = randi + 3;
 
        if (i<levels){
            // with some probability, don't do each/any of these
            twisty(levels, branchLen, i+1, xRoot+xShift, yRoot-yShift, zRoot+zShift, alpha+alphaShift, beta + betaShift, (randi*67)%4229, leaves, branches, randFactors, randProbs);   
            twisty(levels, branchLen, i+1, xRoot+xShift, yRoot-yShift, zRoot+zShift, alpha+alphaShift, beta - betaShift, (randi*61)%3709, leaves, branches, randFactors, randProbs);
            twisty(levels, branchLen, i+1, xRoot+xShift, yRoot-yShift, zRoot+zShift, alpha-alphaShift, beta + betaShift, (randi*29)%3889, leaves, branches, randFactors, randProbs);
            twisty(levels, branchLen, i+1, xRoot+xShift, yRoot-yShift, zRoot+zShift, alpha-alphaShift, beta - betaShift, (randi*13)%4679, leaves, branches, randFactors, randProbs);
            
        }
        else if (leaves){  // draw a leaf at the end of the branch drawn below
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



