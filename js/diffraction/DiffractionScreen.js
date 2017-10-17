// Copyright 2017, University of Colorado Boulder

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var DiffractionModel = require( 'WAVE_INTERFERENCE/diffraction/model/DiffractionModel' );
  var DiffractionScreenView = require( 'WAVE_INTERFERENCE/diffraction/view/DiffractionScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Screen = require( 'JOIST/Screen' );
  var waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );

  /**
   * @constructor
   */
  function DiffractionScreen() {

    var homeScreenIcon = Rectangle.dimension( Screen.MINIMUM_HOME_SCREEN_ICON_SIZE, {
      fill: 'white'
    } );

    var options = {
      backgroundColorProperty: new Property( 'white' ),
      name: 'Diffraction',
      homeScreenIcon: homeScreenIcon
    };

    Screen.call( this,
      function() { return new DiffractionModel(); },
      function( model ) { return new DiffractionScreenView( model ); },
      options
    );
  }

  waveInterference.register( 'DiffractionScreen', DiffractionScreen );

  return inherit( Screen, DiffractionScreen );
} );