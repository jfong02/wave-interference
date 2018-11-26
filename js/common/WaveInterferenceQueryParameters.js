// Copyright 2018, University of Colorado Boulder

/**
 * Query parameters used in sim-specific code.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );

  const WaveInterferenceQueryParameters = QueryStringMachine.getAll( {

    // Shows the overlays for the theoretical/ideal (far-field) interference patterns on the "Slits" screen. This will
    // be shared with teachers and should not be changed lightly.
    theory: { type: 'flag' },

    // This is a temporary query parameter that adds the in-development "Diffraction" screen.
    // Once the Diffraction screen is included in a published version, this query parameter
    // will be deleted.
    includeDiffractionScreen: { type: 'flag' }
  } );

  waveInterference.register( 'WaveInterferenceQueryParameters', WaveInterferenceQueryParameters );

  return WaveInterferenceQueryParameters;
} );
