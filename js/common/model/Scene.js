// Copyright 2016, University of Colorado Boulder

/**
 * The scene determines the medium and emitter types, coordinate frames, relative scale, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Property = require( 'AXON/Property' );
  var Vector2 = require( 'DOT/Vector2' );
  var waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );

  /**
   * @param {Object} config - see below for required properties
   * @constructor
   */
  function Scene( config ) {

    // @public (read-only) {string} - units for this scene
    this.translatedPositionUnits = config.translatedPositionUnits;

    // @public (read-only) {number} - width of the visible part of the lattice in the scene's units
    this.latticeWidth = config.latticeWidth;

    // @public (read-only) {string} - text that describes the horizontal spatial axis
    this.graphHorizontalAxisLabel = config.graphHorizontalAxisLabel;

    // @public (read-only) {number} - minimum allowed frequency in Hz
    this.minimumFrequency = config.minimumFrequency;

    // @public (read-only) {number} - maximum allowed frequency in Hz
    this.maximumFrequency = config.maximumFrequency;

    // @public (read-only) {number} [initialFrequency] - initial frequency in Hz, defaults to the average of min and max
    this.initialFrequency = config.initialFrequency || ( config.minimumFrequency + config.maximumFrequency ) / 2;

    // @public (read-only) {string} - text to show to indicate the relative scale, see ScaleIndicatorNode
    this.scaleIndicatorText = config.scaleIndicatorText;

    // @public (read-only) {number} - length in meters to depict to indicate relative scale, see ScaleIndicatorNode
    this.scaleIndicatorLength = config.scaleIndicatorLength;

    // @public (read-only) {number} - scale factor to convert seconds of wall time to time for the given scene
    this.timeScaleFactor = config.timeScaleFactor;

    // @public (read-only) {number} - scale factor for converting between time units (like showing seconds in femtoseconds)
    this.timeUnitsConversion = config.timeUnitsConversion;

    // @public {Property.<number>} - the frequency in Hz
    this.frequencyProperty = new Property( this.initialFrequency );

    // @public (read-only) {string} - units associated with the time units conversion
    this.timerUnits = config.timerUnits;

    // @public (read-only) {string} text to show on the vertical axis on the wave-area graph
    this.verticalAxisTitle = config.verticalAxisTitle;

    // @public (read-only) {string} - the title to the shown on the wave-area graph
    this.graphTitle = config.graphTitle;

    // @public (read-only) {string} - the unit to display on the WaveDetectorToolNode, like "1 s"
    this.oneTimerUnit = config.oneTimerUnit;

    // @public (read-only) {string} - the units (in English and for the PhET-iO data stream)
    this.positionUnits = config.positionUnits;

    // @public {Property.<Number>} - distance between the sources, or 0 if there is only one source
    this.sourceSeparationProperty = new NumberProperty( 0, {
      units: this.positionUnits
    } );

    // @public {Property.<Number>} - distance between the center of the slits, in the units for this scene
    this.slitSeparationProperty = new NumberProperty( 0, {
      units: this.positionUnits
    } );

    // @public {ModelViewTransform2} - converts the model coordinates (in the units for this scene) to lattice coordinates
    this.modelToLatticeTransform = ModelViewTransform2.createOffsetScaleMapping( Vector2.ZERO, config.latticeBounds.width / this.latticeWidth );

    // @public {Vector2} - horizontal location of the barrier in lattice coordinates (includes damping region)
    //                   - note: this is a floating point 2D representation so it can work seamlessly with DragListener
    //                   - see getBarrierLocation() for how to get the integral x-coordinate.
    //                   - Can be dragged by the node or handle below it.
    this.barrierLocationProperty = new Property( new Vector2( config.latticeWidth / 2, 0 ) );

    // @public {NumberProperty} - width of the slit(s) opening in lattice coordinates.
    this.slitWidthProperty = new NumberProperty( 5 );
  }

  waveInterference.register( 'Scene', Scene );

  return inherit( Object, Scene, {

    /**
     * Restores the initial conditions of this scene.
     * @public
     */
    reset: function() {
      this.frequencyProperty.reset();
      this.slitWidthProperty.reset();
      this.barrierLocationProperty.reset();
      this.slitSeparationProperty.reset();
      this.sourceSeparationProperty.reset();
    }
  } );
} );