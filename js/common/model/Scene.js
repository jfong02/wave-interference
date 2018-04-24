// Copyright 2016, University of Colorado Boulder

/**
 * The scene determines the medium and emitter types, coordinate frames, relative scale, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );

  function Scene( config ) {

    // @public (read-only) {number} - width of the visible part of the lattice in meters
    this.latticeWidth = config.latticeWidth; // in meters

    // @public (read-only) {number} - minimum allowed frequency in Hz
    this.minimumFrequency = config.minimumFrequency;

    // @public (read-only) {number} - maximum allowed frequency in Hz
    this.maximumFrequency = config.maximumFrequency;

    // @public (read-only) {string} - text to show to indicate the relative scale, see ScaleIndicatorNode
    this.scaleIndicatorText = config.scaleIndicatorText; // // TODO: i18n

    // @public (read-only) {number} - length in meters to depict to indicate relative scale, see ScaleIndicatorNode
    this.scaleIndicatorLength = config.scaleIndicatorLength;

    // @public (read-only) {number} - scale factor to convert seconds of wall time to time for the given scene // TODO: is this documented as inverse?
    this.timeScaleFactor = config.timeScaleFactor;

    // @public (read-only) {string} - units to show for measurements
    this.measuringTapeUnits = config.measuringTapeUnits;

    // @public (read-only) {number} - factor for converting between units (like centimeters, nanometers)
    this.metricConversion = config.metricConversion;

    // @public {Property.<number>} - the frequency in Hz
    this.frequencyProperty = new Property( ( config.minimumFrequency + config.maximumFrequency ) / 2 );
  }

  waveInterference.register( 'Scene', Scene );

  return inherit( Object, Scene, {

    /**
     * Restores the initial conditions of this scene.
     * @public
     */
    reset: function() {
      this.frequencyProperty.reset();
    }
  } );
} );