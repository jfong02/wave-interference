// Copyright 2018, University of Colorado Boulder

/**
 * Model for the Slits screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var BarrierTypeEnum = require( 'WAVE_INTERFERENCE/slits/model/BarrierTypeEnum' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Property = require( 'AXON/Property' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );
  var waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  var WavesScreenModel = require( 'WAVE_INTERFERENCE/waves/model/WavesScreenModel' );

  /**
   * @constructor
   */
  function SlitsScreenModel() {
    WavesScreenModel.call( this );
    var self = this;

    // @public {Property.<BarrierTypeEnum>} - type of the barrier in the lattice
    this.barrierTypeProperty = new Property( BarrierTypeEnum.ONE_SLIT );

    // @public {Vector2} - horizontal location of the barrier in lattice coordinates (includes damping region)
    //                   - note: this is a floating point 2D representation so it can work seamlessly with DragListener
    //                   - see getBarrierLocation() for how to get the integral x-coordinate.
    this.barrierLocationProperty = new Property( new Vector2( 38, 0 ) );

    // @public {NumberProperty} - width of the slit(s) in lattice coordinates
    this.slitWidthProperty = new NumberProperty( 5 );

    // @public {NumberProperty} - separation of centers of the slits in lattice coordinates
    this.slitSeparationProperty = new NumberProperty( 20 );

    // TODO(performance): should the potential function be a 2D array?  Could be faster lookup.
    this.lattice.setPotentialFunction( function( i, j ) {
      var barrierLocation = Math.round( self.barrierLocationProperty.get().x );
      var slitWidth = self.slitWidthProperty.get();
      var slitSeparation = self.slitSeparationProperty.get();
      var latticeCenterY = self.lattice.height / 2;
      if ( self.barrierTypeProperty.value === BarrierTypeEnum.NO_BARRIER ) {
        return false;
      }
      else if ( self.barrierTypeProperty.value === BarrierTypeEnum.ONE_SLIT ) {
        return i === barrierLocation && ( ( j > latticeCenterY + slitWidth ) || ( j < latticeCenterY - slitWidth ) );
      }
      else if ( self.barrierTypeProperty.value === BarrierTypeEnum.TWO_SLITS ) {

        // Spacing is between center of slits
        return i === barrierLocation && ( ( Math.abs( latticeCenterY - slitSeparation / 2 - j ) > slitWidth ) && ( Math.abs( latticeCenterY + slitSeparation / 2 - j ) > slitWidth ) );
      }
    } );

    this.barrierLocationProperty.link( function() {

      // When the barrier moves, it creates a lot of artifacts, so clear the wave when the barrier moves
      self.clear();
    } );

    // this.stepEmitter.addListener( function()  );
  }

  waveInterference.register( 'SlitsScreenModel', SlitsScreenModel );

  return inherit( WavesScreenModel, SlitsScreenModel, {

    /**
     * Returns the horizontal barrier location in integer coordinates.
     * @public
     */
    getBarrierLocation: function() {

      // The -1 prevents the barrier from jumping too far when grabbed with the mouse
      // TODO: figure out what causes the -1 and eliminate the need for it.
      return Math.round( this.barrierLocationProperty.get().x ) - 1;
    },

    /**
     * Set the incoming source values, in this case it is a plane wave on the left side of the lattice.
     * @param {Lattice} lattice
     * @override
     * @protected
     */
    setSourceValues: function( lattice ) {

      // In the incoming region, set all lattice values to be an incoming plane wave.  This prevents any reflections
      // and unwanted artifacts
      for ( var i = 0; i < this.getBarrierLocation() + 1; i++ ) {
        for ( var j = 0; j < lattice.height; j++ ) {

          if ( this.button1PressedProperty.get() ) {

            // TODO: map lattice coordinates to model coordinate frame, then do sin(kx-wt) there, perhaps use
            // TODO: wave speed in model coordinates.
            // TODO: Plane wave is wrong speed/wavelength
            var latticeFrequency = this.frequencyProperty.get() * this.sceneProperty.get().timeScaleFactor;
            var k = Util.linear( 1, 19, 0.1, 1, latticeFrequency );

            // Scale the amplitude because it is calibrated for a point source, not a plane wave
            var value = this.amplitudeProperty.get() * 0.21 * Math.sin( k * i - this.frequencyProperty.get() * this.time );
            var lastValue = lattice.getCurrentValue( i, j );
            lattice.setCurrentValue( i, j, value );
            lattice.setLastValue( i, j, lastValue );
          }
          else {

            // Instantly clear the incoming wave, otherwise there are too many odd reflections
            // TODO: Try propagating front/back of the wave, see https://github.com/phetsims/wave-interference/issues/47
            lattice.setCurrentValue( i, j, 0 );
          }
        }
      }
    }
  } );
} );