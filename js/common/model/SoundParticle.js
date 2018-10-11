// Copyright 2018, University of Colorado Boulder

/**
 * When selected, shows discrete, moving particles for the sound scene.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Util = require( 'DOT/Util' );
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  const WaveInterferenceConstants = require( 'WAVE_INTERFERENCE/common/WaveInterferenceConstants' );

  class SoundParticle {

    /**
     * @param {number} i - horizontal lattice coordinate of the particle
     * @param {number} k - vertical lattice coordinate of the particle
     * @param {number} x - initial x coordinate of the particle, in model coordinates
     * @param {number} y - initial y coordinate of the particle, in model coordinates
     */
    constructor( i, k, x, y ) {

      // @public - x coordinate
      this.x = x;

      // @public - y coordinate
      this.y = y;

      // @private
      this.initialX = x;
      this.initialY = y;
      this.vx = 0;
      this.vy = 0;

      // @public {number} - horizontal lattice coordinate of the particle
      this.i = i;

      // @public {number} - vertical lattice coordinate of the particle
      this.k = k;
    }

    /**
     * Applies a force toward the given point with the given strength;
     * @param {number } fx - sum of applied forces in the x direction
     * @param {number} fy - sum of applied forces in the y direction
     * @param {number} dt - time to integrate
     * @param {SoundScene} soundScene - to get the frequency range and value
     */
    applyForce( fx, fy, dt, soundScene ) {

      const RANDOMNESS = WaveInterferenceConstants.SOUND_PARTICLE_RANDOMNESS_PROPERTY.get();

      // the particles move randomly even when there are no waves, because they are not at absolute zero
      // see https://github.com/phetsims/wave-interference/issues/123
      fx += ( Math.random() - 0.5 ) * 2 * RANDOMNESS;
      fy += ( Math.random() - 0.5 ) * 2 * RANDOMNESS;

      // use the airK as the magnitude and the forceCenter for direction only.
      const restorationSpringConstant = Util.linear( soundScene.minimumFrequency, soundScene.maximumFrequency, 2, 6.5, soundScene.frequencyProperty.value ) * WaveInterferenceConstants.SOUND_PARTICLE_RESTORATION_SCALE.get();
      const fSpringX = -restorationSpringConstant * ( this.x - this.initialX );
      const fSpringY = -restorationSpringConstant * ( this.y - this.initialY );
      this.vx += fx + fSpringX;
      this.vy += fy + fSpringY;

      // friction
      const FRICTION_SCALE = WaveInterferenceConstants.SOUND_PARTICLE_FRICTION_SCALE_PROPERTY.get();
      this.vx *= FRICTION_SCALE;
      this.vy *= FRICTION_SCALE;

      // motion
      this.x += this.vx * dt;
      this.y += this.vy * dt;
    }
  }

  return waveInterference.register( 'SoundParticle', SoundParticle );
} );