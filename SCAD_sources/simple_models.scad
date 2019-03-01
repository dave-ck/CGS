dep = 3;

for(x=[0:dep]){
    for(y=[0:dep]){
        for(z=[0:dep]){
            translate([x,y,z])
            rotate([0,15, 30])
            cube(0.5);
    
        }
    }    
}



module Logo(size=10, $fn=5) {
    // Temporary variables
    hole = size/2;
    cylinderHeight = size * 1.25;

    // One positive object (sphere) and three negative objects (cylinders)
    difference() {
        sphere(d=size);
        
        cylinder(d=hole, h=cylinderHeight, center=true);
        // The '#' operator highlights the object
        #rotate([90, 0, 0]) cylinder(d=hole, h=cylinderHeight, center=true);
        rotate([0, 90, 0]) cylinder(d=hole, h=cylinderHeight, center=true);
    }
}