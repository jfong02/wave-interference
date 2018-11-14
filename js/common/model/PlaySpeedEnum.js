// Copyright 2018, University of Colorado Boulder

/**
 * Determines whether the simulation is playing at normal speed or slow motion.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  const Enumeration = require( 'PHET_CORE/Enumeration' );

  return waveInterference.register( 'PlaySpeedEnum', new Enumeration( [ 'NORMAL', 'SLOW' ] ) );
} );