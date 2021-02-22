{

    /**s

     Helper widget that indicates the World coordinate axis.

     The helper works by tracking updates on a xeogl.Camera and orienting a gnomon accordingly.

     @class AxisHelper
     @constructor
     @param cfg {*} Configuration
     @param cfg.camera {xeogl.Camera} A {{#crossLink "xeogl.Camera"}}{{/crossLink}} to observe.
     @param [cfg.size] {Int16Array} Pixel dimensions of helper's canvas, [250, 250] by default.
     */
    module.exports = function(xeogl) {
   
    xeogl.Gizmo = function (cfg) {

        var scene = cfg.scene;
        var camera = scene.camera;

        if (!camera) {
            throw "Param expected: scene.camera";
        }

        var size = cfg.size || [250, 250];

        // Rotate helper in synch with target camera

        // var helperCamera = scene.camera;

        // camera.on("matrix1", function () {

        //     var eye = camera.eye;
        //     var look = camera.look;
        //     var up = camera.up;

        //     var eyeLook = xeogl.math.mulVec3Scalar(xeogl.math.normalizeVec3(xeogl.math.subVec3(eye, look, [])), 22);

        //     helperCamera.look = [0, 0, 0];
        //     helperCamera.eye = eyeLook;
        //     helperCamera.up = up;
        // });

        // ----------------- Components that are shared among more than one mesh ---------------

        var arrowHead = new xeogl.CylinderGeometry(scene, {
            radiusTop: 0.01,
            radiusBottom: 0.6,
            height: 1.7,
            radialSegments: 20,
            heightSegments: 1,
            openEnded: false
        });

        var arrowShaft = new xeogl.CylinderGeometry(scene, {
            radiusTop: 0.2,
            radiusBottom: 0.2,
            height: 4.5,
            radialSegments: 20,
            heightSegments: 1,
            openEnded: false
        });

        var axisMaterial = new xeogl.PhongMaterial(scene, { // Red by convention
            ambient: [0.0, 0.0, 0.0],
            specular: [.6, .6, .3],
            shininess: 80,
            lineWidth: 2
        });

        var xAxisMaterial = new xeogl.PhongMaterial(scene, { // Red by convention
            diffuse: [1, 0.3, 0.3],
            ambient: [0.0, 0.0, 0.0],
            specular: [.6, .6, .3],
            shininess: 80,
            lineWidth: 2
        });

        var xAxisLabelMaterial = new xeogl.PhongMaterial(scene, { // Red by convention
            emissive: [1, 0.3, 0.3],
            ambient: [0.0, 0.0, 0.0],
            specular: [.6, .6, .3],
            shininess: 80,
            lineWidth: 2
        });

        var yAxisMaterial = new xeogl.PhongMaterial(scene, { // Green by convention
            diffuse: [0.3, 1, 0.3],
            ambient: [0.0, 0.0, 0.0],
            specular: [.6, .6, .3],
            shininess: 80,
            lineWidth: 2
        });

        var yAxisLabelMaterial = new xeogl.PhongMaterial(scene, { // Green by convention
            emissive: [0.3, 1, 0.3],
            ambient: [0.0, 0.0, 0.0],
            specular: [.6, .6, .3],
            shininess: 80,
            lineWidth: 2
        });


        var zAxisMaterial = new xeogl.PhongMaterial(scene, { // Blue by convention
            diffuse: [0.3, 0.3, 1],
            ambient: [0.0, 0.0, 0.0],
            specular: [.6, .6, .3],
            shininess: 80,
            lineWidth: 2
        });

        var zAxisLabelMaterial = new xeogl.PhongMaterial(scene, {
            emissive: [0.3, 0.3, 1],
            ambient: [0.0, 0.0, 0.0],
            specular: [.6, .6, .3],
            shininess: 80,
            lineWidth: 2
        });

        var ballMaterial = new xeogl.PhongMaterial(scene, {
            diffuse: [0.5, 0.5, 0.5],
            ambient: [0.0, 0.0, 0.0],
            specular: [.6, .6, .3],
            shininess: 80,
            lineWidth: 2
        });


        // ----------------- Meshes ------------------------------

        var groupX = new xeogl.Group(scene, {
            id: 'groupX',
            position: [0, 0, 0],
            scale: [1, 1, 1],
            visible: true,
        });        
        new xeogl.Mesh(groupX, {  // Arrow
            geometry: arrowHead,
            material: xAxisMaterial,
            collidable: false,
            pickable: true,
            position: [-5, 0, 0],
            rotation: [0, 0, 90],
        });
        new xeogl.Mesh(groupX, {  // Shaft
            geometry: arrowShaft,
            material: xAxisMaterial,
            collidable: false,
            pickable: false,
            position: [-2, 0, 0],
            rotation: [0, 0, 90],
        });

        // new xeogl.Mesh(groupX, {
        //     geometry: new xeogl.SphereGeometry(scene, {
        //         radius: 1.0,
        //         heightSegments: 60,
        //         widthSegments: 60
        //     }),
        //     material: new xeogl.PhongMaterial(scene, {
        //         diffuse: [0.0, 0.0, 0.0],
        //         emissive: [0.1, 0.1, 0.1],
        //         ambient: [0.1, 0.1, 0.2],
        //         specular: [0, 0, 0],
        //         alpha: 0.4,
        //         alphaMode: "blend",
        //         frontface: "cw"
        //     }),
        //     pickable: true,
        //     collidable: false,
        //     visible: true,
        // });
        new xeogl.Mesh(groupX, {  // Arrow
            geometry: new xeogl.SphereGeometry(scene, {
                radius: 0.5
            }),
            material: ballMaterial,
            pickable: false,
            collidable: false,
        });

        var groupY = new xeogl.Group(scene, {
            id: 'groupY',
            position: [0, 0, 0],
            scale: [1, 1, 1],
            visible: true,
        });
        new xeogl.Mesh(groupY, {  // Arrow
            geometry: arrowHead,
            material: yAxisMaterial,
            pickable: true,
            collidable: false,
            position: [0, 5, 0]
        });
        new xeogl.Mesh(groupY, {  // Shaft
            geometry: arrowShaft,
            material: yAxisMaterial,
            pickable: false,
            collidable: false,
            position: [0, 2, 0]
        });

        var groupZ = new xeogl.Group(scene, {
            id: 'groupZ',
            position: [0, 0, 0],
            scale: [1, 1, 1],
            visible: true,
        });
        new xeogl.Mesh(groupZ, {  // Arrow
            geometry: arrowHead,
            material: zAxisMaterial,
            pickable: true,
            collidable: false,
            position: [0, 0, 5],
            rotation: [90, 0, 0]
        });
        new xeogl.Mesh(groupZ, {  // Shaft
            geometry: arrowShaft,
            material: zAxisMaterial,
            pickable: false,
            collidable: false,
            position: [0, 0, 2],
            rotation: [90, 0, 0]
        });

        /** Shows or hides this helper
         *
         * @param visible
         */
        this.setVisible = function (visible) {
            groupX.visible = true;
            //for (var i = 0; i < meshes.length; i++) {
            //    meshes[i].visible = visible;
            //  }
        }
    };
}
     
}