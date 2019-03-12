sizeFactor = 1.1;
gamma = 18;
chungus = 12;
k = 4;
maxLen = 10;
lowR = 0.8;
upR = 1.2;

twisty(4);

module twisty(levels, lastLen=maxLen, i=0, xRoot = 0, yRoot = 0, zRoot=0, alpha=0, beta=0){
    randFactors = rands(lowR, upR, 10);    //IMPORTANT remove seed when done testing
    branchLen = (lastLen/sizeFactor) * randFactors[0] / upR; //ensure not greater than lastLen      
    xShift =  cos(alpha) * sin(beta) * branchLen;
    yShift = sin(alpha) * branchLen;
    zShift = cos(alpha) * cos(beta) * branchLen;
    // choose alpha, beta shifts at random
    alphaShift = gamma * randFactors[1];
    betaShift = gamma * randFactors[2];

    
    //echo("Currentfactor", currentFactor, " CurrentX:", x);
    //echo(2.32*tan(80));
    //echo("Alpha", alpha, " xShift:",  xShift, " zShift:", zShift);
    //if (abs(alpha) < 75 && abs(beta) < 75){
        if (i<levels){
            // with some probability, don't do each of these
            twisty(levels, branchLen, i+1, xRoot+xShift, yRoot-yShift, zRoot+zShift, alpha+alphaShift, beta + betaShift);   
            twisty(levels, branchLen, i+1, xRoot+xShift, yRoot-yShift, zRoot+zShift, alpha+alphaShift, beta - betaShift);
            twisty(levels, branchLen, i+1, xRoot+xShift, yRoot-yShift, zRoot+zShift, alpha-alphaShift, beta + betaShift);
            twisty(levels, branchLen, i+1, xRoot+xShift, yRoot-yShift, zRoot+zShift, alpha-alphaShift, beta - betaShift);
            
        }
        else {  // draw a leaf at the end of the branch drawn below
            leaf(i+1, xRoot+xShift, yRoot-yShift, zRoot+zShift, alpha+alphaShift,  beta + betaShift);
            leaf(i+1, xRoot+xShift, yRoot-yShift, zRoot+zShift, alpha+alphaShift,  beta - betaShift);
            leaf(i+1, xRoot+xShift, yRoot-yShift, zRoot+zShift, alpha-alphaShift,  beta + betaShift);
            leaf(i+1, xRoot+xShift, yRoot-yShift, zRoot+zShift, alpha-alphaShift,  beta - betaShift);
        }
    color("brown"){
        
        translate([xRoot, yRoot, zRoot]){
        rotate([0, beta,0])
                    rotate([alpha, 0,0])

        branch(lastLen, branchLen);
        }    
    }
}

module leaf(levels, x=0, y=0, z=0, alphaX=0, beta=0){
    color("green"){
        size = maxLen/pow(sizeFactor, levels)/2;
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



