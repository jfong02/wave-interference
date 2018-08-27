// Copyright 2018, University of Colorado Boulder

/**
 * Model for the "Waves" screen and other derivative screens.  This model supports two sources, even though the waves
 * screen only uses one.  The controls are in a metric coordinate frame, and there is a transformation to convert
 * metric coordinates to lattice coordinates.  On the view side there is another transformation to convert lattice or
 * metric coordinates to view coordinates.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const Emitter = require( 'AXON/Emitter' );
  const EventTimer = require( 'PHET_CORE/EventTimer' );
  const IncomingWaveType = require( 'WAVE_INTERFERENCE/common/model/IncomingWaveType' );
  const IntensitySample = require( 'WAVE_INTERFERENCE/common/model/IntensitySample' );
  const Lattice = require( 'WAVE_INTERFERENCE/common/model/Lattice' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const PlaySpeedEnum = require( 'WAVE_INTERFERENCE/common/model/PlaySpeedEnum' );
  const SoundParticle = require( 'WAVE_INTERFERENCE/common/model/SoundParticle' );
  const Property = require( 'AXON/Property' );
  const Scene = require( 'WAVE_INTERFERENCE/common/model/Scene' );
  const Util = require( 'DOT/Util' );
  const Vector2 = require( 'DOT/Vector2' );
  const ViewType = require( 'WAVE_INTERFERENCE/common/model/ViewType' );
  const VisibleColor = require( 'SCENERY_PHET/VisibleColor' );
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  const WaveInterferenceUtils = require( 'WAVE_INTERFERENCE/common/WaveInterferenceUtils' );

  // strings
  const cmUnitsString = require( 'string!WAVE_INTERFERENCE/cmUnits' );
  const electricFieldAtCenterString = require( 'string!WAVE_INTERFERENCE/electricFieldAtCenter' );
  const electricFieldString = require( 'string!WAVE_INTERFERENCE/electricField' );
  const femtosecondConversionString = require( 'string!WAVE_INTERFERENCE/femtosecondConversion' );
  const femtosecondsUnitsString = require( 'string!WAVE_INTERFERENCE/femtosecondsUnits' );
  const millisecondConversionString = require( 'string!WAVE_INTERFERENCE/millisecondConversion' );
  const millisecondsUnitsString = require( 'string!WAVE_INTERFERENCE/millisecondsUnits' );
  const nanometersUnitsString = require( 'string!WAVE_INTERFERENCE/nanometersUnits' );
  const positionCMString = require( 'string!WAVE_INTERFERENCE/positionCM' );
  const positionNMString = require( 'string!WAVE_INTERFERENCE/positionNM' );
  const pressureAtCenterString = require( 'string!WAVE_INTERFERENCE/pressureAtCenter' );
  const pressureString = require( 'string!WAVE_INTERFERENCE/pressure' );
  const secondsUnitsString = require( 'string!WAVE_INTERFERENCE/secondsUnits' );
  const waterLevelAtCenterString = require( 'string!WAVE_INTERFERENCE/waterLevelAtCenter' );
  const waterLevelString = require( 'string!WAVE_INTERFERENCE/waterLevel' );

  // constants

  // Cell that oscillates, specified as an offset from the origin of the lattice (includes damping region).  This value
  // must be coordinated with WaterEmitterNode's waterDrops[ index ].centerX
  const POINT_SOURCE_HORIZONTAL_COORDINATE = 24;

  // Tuned so that iPad2 has enough time to run model computations
  const EVENT_RATE = 20;
  const toFemto = WaveInterferenceUtils.toFemto;

  class WavesScreenModel {

    /**
     * @param {Object} [options]
     */
    constructor( options ) {

      options = _.extend( {

        // This model supports one or two sources.  If the sources are initially separated, there are two sources
        numberOfSources: 1,

        // Initial amplitude, between 0-10
        initialAmplitude: 8
      }, options );
      assert && assert( options.numberOfSources === 1 || options.numberOfSources === 2, 'Model only supports 1 or 2 sources' );

      // @public {Lattice} the grid that contains the wave values
      this.lattice = new Lattice( 100, 100, 20, 20 );

      // @public {Property.<ViewType>}
      this.viewTypeProperty = new Property( ViewType.TOP, {
        validValues: ViewType.VALUES
      } );

      // Water scene
      this.waterScene = new Scene( {
        positionUnits: 'cm',
        translatedPositionUnits: cmUnitsString,
        timeUnits: secondsUnitsString,
        timeScaleString: '',

        verticalAxisTitle: waterLevelString,
        graphTitle: waterLevelAtCenterString,
        graphHorizontalAxisLabel: positionCMString,
        waveAreaWidth: 10, // 10 centimeters
        minimumFrequency: 0.25, // cycles per second
        maximumFrequency: 1, // cycles per second
        scaleIndicatorLength: 1, // 1 centimeter
        numberOfSources: options.numberOfSources,
        lattice: this.lattice,
        waveSpeed: 1.85, // in position units / time units, measured empirically as 5.4 seconds to cross the 10cm lattice

        timeScaleFactor: 1, // 1 second in real time = 1 second on the simulation timer

        initialSlitWidth: 2, // cm
        initialSlitSeparation: 3 // cm
      } );

      // Sound scene
      this.soundScene = new Scene( {
        positionUnits: 'cm',
        translatedPositionUnits: cmUnitsString,
        timeUnits: millisecondsUnitsString,
        timeScaleString: millisecondConversionString,

        verticalAxisTitle: pressureString,
        graphTitle: pressureAtCenterString,
        graphHorizontalAxisLabel: positionCMString,
        waveAreaWidth: 200, // in cm
        minimumFrequency: 220 / 1000, // A3 in cycles per ms, wavelength is 156.82cm
        maximumFrequency: 1760 / 1000, // A6 in cycles per ms, wavelength is 19.60cm
        scaleIndicatorLength: 10, // cm
        numberOfSources: options.numberOfSources,
        lattice: this.lattice,
        waveSpeed: 34.3, // in cm/ms

        timeScaleFactor: 1, // This is confusing.  One second of real time should show up as 1ms, so this factor is 1

        initialSlitWidth: 25, // cm
        initialSlitSeparation: 50 // cm
      } );

      // Light scene
      this.lightScene = new Scene( {
        positionUnits: 'nm',
        translatedPositionUnits: nanometersUnitsString,
        timeUnits: femtosecondsUnitsString,
        timeScaleString: femtosecondConversionString,
        verticalAxisTitle: electricFieldString,
        graphTitle: electricFieldAtCenterString,
        graphHorizontalAxisLabel: positionNMString,
        waveAreaWidth: 5000, // nm
        minimumFrequency: toFemto( VisibleColor.MIN_FREQUENCY ), // in cycles per femtosecond
        maximumFrequency: toFemto( VisibleColor.MAX_FREQUENCY ), // in cycles per femtosecond
        initialFrequency: toFemto( VisibleColor.SPEED_OF_LIGHT / 660E-9 ), // Start with red light because it is a familiar LED color
        scaleIndicatorLength: 500, // nm

        numberOfSources: options.numberOfSources,
        lattice: this.lattice,

        // in nm/fs
        waveSpeed: 299.792458,

        // One second in real time = 1 femtosecond.  Determined empirically by checking the displayed wavelength of red
        // light on the lattice and dividing by the desired wavelength
        timeScaleFactor: 1853 / 660,

        initialSlitWidth: 500, // nm
        initialSlitSeparation: 1500 // nm
      } );

      // @public (read-only) {Scene[]} - the Scene instances as an array
      this.scenes = [ this.waterScene, this.soundScene, this.lightScene ];

      const eventTimerModel = new EventTimer.ConstantEventModel( EVENT_RATE );

      // @private
      this.eventTimer = new EventTimer( eventTimerModel, timeElapsed => this.advanceTime( 1 / EVENT_RATE, false ) );

      // @public {Property.<Scene>} - selected scene
      this.sceneProperty = new Property( this.waterScene, {
        validValues: [ this.waterScene, this.soundScene, this.lightScene ]
      } );

      // @public {NumberProperty} - controls the amplitude of the wave.  We optimize the view for the max, but starting
      // the value at the extreme may prevent the user from exploring the range, so we start closer to the max but not
      // at the max.  I chose 8 so it would match up directly with a tickmark (when it was at 7.5, it covered 2 tickmarks
      // and looked odd)
      this.amplitudeProperty = new NumberProperty( options.initialAmplitude, { range: { min: 0, max: 10 } } );

      // @public {BooleanProperty} - whether the wave area should be displayed
      this.showWavesProperty = new BooleanProperty( true );

      // @public {BooleanProperty} - whether particles should be displayed (for sound)
      this.showParticlesProperty = new BooleanProperty( false );

      // @public {BooleanProperty} - whether the wave area graph should be displayed
      this.showGraphProperty = new BooleanProperty( false );

      // @public {BooleanProperty} - whether the screen (on the right of the lattice) should be shown.
      this.showScreenProperty = new BooleanProperty( false );

      // @public {BooleanProperty} - whether the intensity graph (on the right of the lattice) should be shown.
      this.showIntensityGraphProperty = new BooleanProperty( false );

      // @public {Property.<IncomingWaveType>} - pulse or continuous
      this.inputTypeProperty = new Property( IncomingWaveType.CONTINUOUS, {
        validValues: IncomingWaveType.VALUES
      } );

      // @public {Property.<PlaySpeedEnum>} - the speed at which the simulation is playing
      this.playSpeedProperty = new Property( PlaySpeedEnum.NORMAL, {
        validValues: PlaySpeedEnum.VALUES
      } );

      // @public {BooleanProperty} - whether the model is moving forward in time
      this.isRunningProperty = new BooleanProperty( true );

      // @public {BooleanProperty} - whether the measuring tape has been dragged out of the toolbox into the play area
      this.isMeasuringTapeInPlayAreaProperty = new BooleanProperty( false );

      // @public {BooleanProperty} - true if the timer is running
      this.isTimerRunningProperty = new BooleanProperty( false );

      // @public {NumberProperty} - time elapsed on the timer since it was last restarted
      this.timerElapsedTimeProperty = new NumberProperty( 0, {
        units: 'seconds'
      } );

      // @public {BooleanProperty} - true if the timer has been dragged out of the toolbox into the play area
      this.isTimerInPlayAreaProperty = new BooleanProperty( false );

      // @public
      this.isWaveMeterInPlayAreaProperty = new BooleanProperty( false );

      // @public {Property.<number>} - amount the 3d view is rotated. 0 means top view, 1 means side view.
      const rotationRange = { min: 0, max: 1 };
      this.rotationAmountProperty = new NumberProperty( 0, {
        range: rotationRange
      } );

      // @public {DerivedProperty.<boolean>} - true if the system is rotating
      this.isRotatingProperty = new DerivedProperty( [ this.rotationAmountProperty ],
        rotationAmount => rotationAmount !== rotationRange.min && rotationAmount !== rotationRange.max
      );

      // @public {Emitter} - emits once per step
      this.stepEmitter = new Emitter();

      // @public {BooleanProperty} - true while a single pulse is being generated
      this.pulseFiringProperty = new BooleanProperty( false );

      // @private {number} - indicates the time when the pulse began, or 0 if there is no pulse.
      this.pulseStartTime = 0;

      // @public {BooleanProperty} - true when the first source is continuously oscillating
      this.continuousWave1OscillatingProperty = new BooleanProperty( false );

      // @public {BooleanProperty} - true when the second source is continuously oscillating
      this.continuousWave2OscillatingProperty = new BooleanProperty( false );

      // @public {IntensitySample} reads out the intensity on the right hand side of the lattice
      this.intensitySample = new IntensitySample( this.lattice );

      // @public {number} - elapsed time in seconds
      this.timeProperty = new NumberProperty( 0 );

      // @public {number} phase of the emitter
      this.phase = 0;

      // @public {Property.<Boolean>} - whether the button for the first source is pressed.  This is also used for the
      // slits screen plane wave source.
      this.button1PressedProperty = new BooleanProperty( false );

      // @public {Property.<Boolean>} - whether the button for the second source is pressed
      this.button2PressedProperty = new BooleanProperty( false );

      // @public {Property.<Vector2>} - model for the view coordinates of the base of the measuring tape
      // We use view coordinates so that nothing needs to be done when switching scenes and coordinate frames.
      this.measuringTapeBasePositionProperty = new Property( new Vector2( 200, 200 ) );

      // @public {Property.<Vector2>} - model for the view coordinates of the tip of the measuring tape
      this.measuringTapeTipPositionProperty = new Property( new Vector2( 220, 200 ) );

      // When frequency changes, choose a new phase such that the new sine curve has the same value and direction
      // for continuity
      const phaseUpdate = ( newFrequency, oldFrequency ) => {

        // For the main model, Math.sin is performed on angular frequency, so to match the phase, that computation
        // should also be based on angular frequencies
        const oldAngularFrequency = oldFrequency * Math.PI * 2;
        const newAngularFrequency = newFrequency * Math.PI * 2;
        const time = this.timeProperty.value;

        const oldValue = Math.sin( time * oldAngularFrequency + this.phase );
        let proposedPhase = Math.asin( oldValue ) - time * newAngularFrequency;
        const oldDerivative = Math.cos( time * oldAngularFrequency + this.phase );
        const newDerivative = Math.cos( time * newAngularFrequency + proposedPhase );

        // If wrong phase, take the sin value from the opposite side and move forward by half a cycle
        if ( oldDerivative * newDerivative < 0 ) {
          proposedPhase = Math.asin( -oldValue ) - time * newAngularFrequency + Math.PI;
        }

        this.phase = proposedPhase;

        // The wave area resets when the wavelength changes in the light scene
        if ( this.sceneProperty.get() === this.lightScene ) {
          this.clear();
        }
      };
      this.waterScene.frequencyProperty.lazyLink( phaseUpdate );
      this.soundScene.frequencyProperty.lazyLink( phaseUpdate );
      this.lightScene.frequencyProperty.lazyLink( phaseUpdate );

      // The first button can trigger a pulse, or continuous wave, depending on the inputTypeProperty
      this.button1PressedProperty.lazyLink( isPressed => {
        if ( isPressed ) {
          this.resetPhase();
        }
        if ( isPressed && this.inputTypeProperty.value === IncomingWaveType.PULSE ) {
          assert && assert( !this.pulseFiringProperty.value, 'Cannot fire a pulse while a pulse is already being fired' );
          this.pulseFiringProperty.value = true;
          this.pulseStartTime = this.timeProperty.value;
        }
        else {
          this.continuousWave1OscillatingProperty.value = isPressed;
        }
      } );

      // The 2nd button starts the second continuous wave
      this.button2PressedProperty.lazyLink( isPressed => {
        if ( isPressed ) {
          this.resetPhase();
        }
        this.continuousWave2OscillatingProperty.value = isPressed;
      } );

      // When the pulse ends, the button pops out
      this.pulseFiringProperty.lazyLink( pulseFiring => {
        if ( !pulseFiring ) {
          this.button1PressedProperty.value = false;
        }
      } );

      // When the user selects "PULSE", the button pops out.
      this.inputTypeProperty.link( inputType => {
        if ( inputType === IncomingWaveType.PULSE ) {
          this.button1PressedProperty.value = false;
        }
      } );

      // @public {SoundParticle[]} particles for the sound scene.
      this.soundParticles = [];
      const SOUND_PARTICLE_ROWS = 20;
      const SOUND_PARTICLE_COLUMNS = 20;
      const RANDOM_RADIUS = 2;
      for ( let i = 0; i <= SOUND_PARTICLE_ROWS; i++ ) {
        for ( let k = 0; k <= SOUND_PARTICLE_COLUMNS; k++ ) {
          this.soundParticles.push( new SoundParticle(
            i * this.soundScene.waveAreaWidth / SOUND_PARTICLE_ROWS + phet.joist.random.nextGaussian() * RANDOM_RADIUS,
            k * this.soundScene.waveAreaWidth / SOUND_PARTICLE_COLUMNS + phet.joist.random.nextGaussian() * RANDOM_RADIUS
          ) );
        }
      }

      // @public - Notifies listeners when the model reset is complete
      this.resetEmitter = new Emitter();

      // When the scene changes, the wave clears and time resets.  This prevents a problem where the amplitude of the
      // emitter would get stuck when switching from water to light after 20 seconds.
      this.sceneProperty.link( () => {
        this.timeProperty.value = 0;
        this.clear();
        this.timerElapsedTimeProperty.reset(); // Timer units change when the scene changes, so we re-start the timer.
      } );
    }

    /**
     * Clears the wave and the Intensity Sample
     * @public
     */
    clear() {
      this.lattice.clear();
      this.intensitySample.clear();
    }

    /**
     * Advance time by the specified amount
     * @param {number} dt - amount of time in seconds to move the model forward
     * @public
     */
    step( dt ) {

      // Feed the real time to the eventTimer and it will trigger advanceTime at the appropriate rate
      this.eventTimer.step( dt );
    }

    /**
     * Additionally called from the "step" button
     * @param {number} wallDT - amount of wall time that passed, will be scaled by time scaling value
     * @param {boolean} manualStep - true if the step button is being pressed
     * @public
     */
    advanceTime( wallDT, manualStep ) {

      const frequency = this.sceneProperty.get().frequencyProperty.get();
      const period = 1 / frequency;

      // Animate the rotation, if it needs to rotate.  This is not subject to being paused, because we would like
      // students to be able to see the side view, pause it, then switch to the corresponding top view, and vice versa.
      const sign = this.viewTypeProperty.get() === ViewType.TOP ? -1 : +1;
      this.rotationAmountProperty.value = Util.clamp( this.rotationAmountProperty.value + wallDT * sign * 1.4, 0, 1 );

      if ( !this.isRunningProperty.get() && !manualStep ) {
        return;
      }

      const dt = wallDT * this.sceneProperty.value.timeScaleFactor * this.playSpeedProperty.get().scaleFactor;
      this.timeProperty.value += dt;

      // If the pulse is running, end the pulse after one period
      if ( this.pulseFiringProperty.get() ) {
        const timeSincePulseStarted = this.timeProperty.value - this.pulseStartTime;
        if ( timeSincePulseStarted > period ) {
          this.pulseFiringProperty.set( false );
          this.pulseStartTime = 0;
        }
      }

      // Update the lattice
      this.lattice.step( () => this.setSourceValues() );

      if ( this.isTimerRunningProperty.get() ) {
        this.timerElapsedTimeProperty.set( this.timerElapsedTimeProperty.get() + dt );
      }

      this.lattice.interpolationRatio = this.eventTimer.getRatio();

      if ( this.sceneProperty.value === this.soundScene ) {

        // TODO: move soundParticles to a subclass of Scene like SoundScene?
        // http://homepage.physics.uiowa.edu/~fskiff/Physics_044/Some%20more%20details%20on%20Sound.pdf
        // https://www.npr.org/2014/04/09/300563606/what-does-sound-look-like
        this.soundParticles.forEach( soundParticle => {

          // Check the lattice coordinate of the current location of the particle
          const latticeCoordinate = this.soundScene.modelToLatticeTransform.modelToViewXY( soundParticle.x, soundParticle.y );

          // feel a force toward each neighboring lattice value
          let sumFx = 0;
          let sumFy = 0;
          const searchRadius = 1; // TODO: increase search radius?
          const CLAMPED_WAVE_VALUE = 1;

          for ( let i = -searchRadius; i <= searchRadius; i++ ) {
            for ( let k = -searchRadius; k <= searchRadius; k++ ) {
              const neighborI = Math.round( latticeCoordinate.x ) + i;
              const neighborJ = Math.round( latticeCoordinate.y ) + k;
              if ( this.lattice.contains( neighborI, neighborJ ) ) {
                let waveValue = this.lattice.getCurrentValue( neighborI, neighborJ );
                if ( waveValue > CLAMPED_WAVE_VALUE ) {
                  waveValue = CLAMPED_WAVE_VALUE;
                }
                else if ( waveValue < -CLAMPED_WAVE_VALUE ) {
                  waveValue = -CLAMPED_WAVE_VALUE;
                }
                const springConstant = waveValue / searchRadius / searchRadius / 5 * 3;
                const forceCenter = this.soundScene.modelToLatticeTransform.viewToModelXY( neighborI, neighborJ );

                const fAirX = -springConstant * ( soundParticle.x - forceCenter.x );
                const fAirY = -springConstant * ( soundParticle.y - forceCenter.y );
                sumFx += fAirX;
                sumFy += fAirY;
              }
            }
          }
          soundParticle.applyForce( sumFx, sumFy, dt );
        } );
      }

      // Notify listeners that a frame has advanced
      this.stepEmitter.emit();

      // Notify listeners about changes
      this.lattice.changedEmitter.emit();

      this.intensitySample.step();
    }

    /**
     * Start the sine argument at 0 so it will smoothly form the first wave.
     * @private
     */
    resetPhase() {
      const frequency = this.sceneProperty.get().frequencyProperty.get();
      const angularFrequency = Math.PI * 2 * frequency;

      // Solve for the sin arg = 0 in Math.sin( this.time * angularFrequency + this.phase )
      // The phase was adjusted so that when the water is turned on under default circumstances, a drop doesn't appear
      // right above the water.
      this.phase = -this.timeProperty.value * angularFrequency + Math.PI * 0.6;
    }

    /**
     * Set the incoming source values, in this case it is a point source near the left side of the lattice (outside of the damping region).
     * @override
     * @protected
     */
    setSourceValues() {
      const lattice = this.lattice;
      const continuous1 = ( this.inputTypeProperty.get() === IncomingWaveType.CONTINUOUS ) && this.continuousWave1OscillatingProperty.get();
      const continuous2 = ( this.inputTypeProperty.get() === IncomingWaveType.CONTINUOUS ) && this.continuousWave2OscillatingProperty.get();

      if ( continuous1 || continuous2 || this.pulseFiringProperty.get() ) {

        // The simulation is designed to start with a downward wave, corresponding to water splashing in
        const frequency = this.sceneProperty.get().frequencyProperty.value;
        const angularFrequency = Math.PI * 2 * frequency;
        const waveValue = -Math.sin( this.timeProperty.value * angularFrequency + this.phase ) * this.amplitudeProperty.get();

        // assumes a square lattice
        const separationInLatticeUnits = this.sceneProperty.get().sourceSeparationProperty.get() / this.sceneProperty.get().waveAreaWidth * this.lattice.visibleBounds.width;
        const distanceAboveAxis = Math.round( separationInLatticeUnits / 2 );

        // Named with a "J" suffix instead of "Y" to remind us we are working in integral (i,j) lattice coordinates.
        const latticeCenterJ = Math.round( this.lattice.height / 2 );

        // Point source
        if ( this.continuousWave1OscillatingProperty.get() || this.pulseFiringProperty.get() ) {
          lattice.setCurrentValue( POINT_SOURCE_HORIZONTAL_COORDINATE, latticeCenterJ + distanceAboveAxis, waveValue );
        }

        // Secondary source (note if there is only one source, this sets the same value as above)
        if ( this.continuousWave2OscillatingProperty.get() ) {
          lattice.setCurrentValue( POINT_SOURCE_HORIZONTAL_COORDINATE, latticeCenterJ - distanceAboveAxis, waveValue );
        }
      }
    }

    /**
     * Restores the initial conditions
     * @public
     */
    reset() {

      // Reset frequencyProperty first because it changes the time and phase.  This is done by resetting each of the
      // frequencyProperties in the scenes
      this.waterScene.reset();
      this.soundScene.reset();
      this.lightScene.reset();

      this.timeProperty.value = 0;
      this.phase = 0;
      this.lattice.clear();
      this.sceneProperty.reset();
      this.viewTypeProperty.reset();
      this.amplitudeProperty.reset();
      this.showGraphProperty.reset();
      this.inputTypeProperty.reset();
      this.playSpeedProperty.reset();
      this.isRunningProperty.reset();
      this.showScreenProperty.reset();
      this.button1PressedProperty.reset();
      this.button2PressedProperty.reset();
      this.rotationAmountProperty.reset();
      this.timerElapsedTimeProperty.reset();
      this.isTimerInPlayAreaProperty.reset();
      this.showIntensityGraphProperty.reset();
      this.measuringTapeTipPositionProperty.reset();
      this.measuringTapeBasePositionProperty.reset();
      this.isMeasuringTapeInPlayAreaProperty.reset();
      this.continuousWave1OscillatingProperty.reset();
      this.continuousWave2OscillatingProperty.reset();
      this.isWaveMeterInPlayAreaProperty.reset();

      // Signify for listeners that the model reset is complete
      this.resetEmitter.emit();
    }

    static get EVENT_RATE() {
      return EVENT_RATE;
    }
  }

  return waveInterference.register( 'WavesScreenModel', WavesScreenModel );
} );