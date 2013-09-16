var Circle = require('../objects/Shape').Circle,
    Plane = require('../objects/Shape').Plane,
    Shape = require('../objects/Shape').Shape,
    Particle = require('../objects/Shape').Particle,
    bp = require('../collision/Broadphase'),
    Broadphase = bp.Broadphase,
    vec2 = require('../math/vec2');

exports.NaiveBroadphase = NaiveBroadphase;

/**
 * Naive broadphase implementation. Does N^2 tests.
 *
 * @class NaiveBroadphase
 * @constructor
 * @extends Broadphase
 */
function NaiveBroadphase(){
    Broadphase.apply(this);
};
NaiveBroadphase.prototype = new Object(Broadphase.prototype);

var xi1_world = vec2.fromValues(0,0),
    xj1_world = vec2.fromValues(0,0),
    zero = vec2.fromValues(0,0);

/**
 * Get the colliding pairs
 * @method getCollisionPairs
 * @param  {World} world
 * @return {Array}
 */
NaiveBroadphase.prototype.getCollisionPairs = function(world){
    var bodies = world.bodies;
    var result = [];

    for(var i=0, Ncolliding=bodies.length; i!==Ncolliding; i++){
        var bi = bodies[i];

        for(var j=0; j<i; j++){
            var bj = bodies[j];

            var collide = false;

            // Loop over all shapes of body i
            for(var k=0; !collide && k<bi.shapes.length; k++){
                var si = bi.shapes[k],
                    xi = bi.shapeOffsets[k] || zero,
                    ai = bi.shapeAngles[k] || 0;

                // All shapes of body j
                for(var l=0; !collide && l<bj.shapes.length; l++){
                    var sj = bj.shapes[l],
                        xj = bj.shapeOffsets[l] || zero,
                        aj = bj.shapeAngles[l] || 0;

                    // Swap - makes the later switch() stuff easier
                    var bi1 = bi,
                        bj1 = bj,
                        si1 = si,
                        sj1 = sj,
                        xi1 = xi,
                        xj1 = xj,
                        ai1 = ai,
                        aj1 = aj;
                    if(si1.type > sj1.type){
                        var temp;
                        temp = bi1; bi1 = bj1; bj1 = temp;
                        temp = si1; si1 = sj1; sj1 = temp;
                        temp = xi1; xi1 = xj1; xj1 = temp;
                        temp = ai1; ai1 = aj1; aj1 = temp;
                    }

                    vec2.rotate(xi1_world, xi1, bi1.angle);
                    vec2.rotate(xj1_world, xj1, bj1.angle);
                    vec2.add(xi1_world, xi1_world, bi1.position);
                    vec2.add(xj1_world, xj1_world, bj1.position);
                    var ai1_world = ai1 + bi1.angle;
                    var aj1_world = aj1 + bj1.angle;

                    switch(si1.type){
                    case Shape.CIRCLE:

                        switch(sj1.type){
                        case Shape.CIRCLE:
                            collide = bp.checkCircleCircle(si1,xi1_world,sj1,xj1_world);
                            break;

                        case Shape.PLANE:
                            collide = bp.checkCirclePlane(si1,xi1_world,sj1,xj1_world,aj1_world);
                            break;

                        case Shape.PARTICLE:
                            collide = bp.checkCircleParticle(si1,xi1_world,sj1,xj1_world);
                            break;
                        }

                        break;


                    case Shape.PARTICLE:
                        switch(sj1.type){
                        case Shape.PLANE:
                            collide = bp.checkParticlePlane(si1,xi1_world,sj1,xj1_world,aj1_world);
                            break;
                        }
                    }

                    if(collide){
                        collide = true;
                        result.push(bi1,bj1);
                    }
                }
            }
        }
    }

    return result;
};
