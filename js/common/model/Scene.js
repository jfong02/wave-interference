// Copyright 2018-2019, University of Colorado Boulder

/**
 * The scene determines the medium and wave generator types, coordinate frames, relative scale, etc.  For a description
 * of which features are independent or shared across scenes, please see
 * https://github.com/phetsims/wave-interference/issues/179#issuecomment-437176489
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const BarrierTypeEnum = require( 'WAVE_INTERFERENCE/slits/model/BarrierTypeEnum' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const DisturbanceTypeEnum = require( 'WAVE_INTERFERENCE/common/model/DisturbanceTypeEnum' );
  const Lattice = require( 'WAVE_INTERFERENCE/common/model/Lattice' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Property = require( 'AXON/Property' );
  const Range = require( 'DOT/Range' );
  const Rectangle = require( 'DOT/Rectangle' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const TemporalMask = require( 'WAVE_INTERFERENCE/common/model/TemporalMask' );
  const Util = require( 'DOT/Util' );
  const Validator = require( 'AXON/Validator' );
  const Vector2 = require( 'DOT/Vector2' );
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  const WaveInterferenceConstants = require( 'WAVE_INTERFERENCE/common/WaveInterferenceConstants' );
  const WaveSpatialTypeEnum = require( 'WAVE_INTERFERENCE/common/model/WaveSpatialTypeEnum' );

  // strings
  const distanceUnitsString = require( 'string!WAVE_INTERFERENCE/distanceUnits' );
  const timeUnitsString = require( 'string!WAVE_INTERFERENCE/timeUnits' );

  // constants
  const PLANE_WAVE_MAGNITUDE = 0.21;
  const POSITIVE_NUMBER = {
    valueType: 'number',
    isValidValue: v => v > 0
  };
  const VALID_STRING = {
    valueType: 'string',
    isValidValue: s => s.length > 0
  };
  const VALID_RANGE = {
    valueType: Range,
    isValidValue: range => range.min > 0 && range.max > 0
  };

  class Scene {

    /**
     * @param {Object} config - see below for required properties
     */
    constructor( config ) {

      config = _.extend( {

        // Wave type
        numberOfSources: null, // {number} - 1 or 2
        waveSpatialType: null, // {WaveSpatialTypeEnum}

        // Values and units for indicators
        scaleIndicatorLength: null, // {number} - length that depicts indicate relative scale, see LengthScaleIndicatorNode
        timeScaleString: null, // {string} - displayed at the top right of the wave area
        translatedPositionUnits: null, // {string} - units for this scene
        positionUnits: null, // {string} - the units (in English and for the PhET-iO data stream)
        timeUnits: null, // {string} - units for time, shown in the timer and optionally top right of the lattice

        // Dimensions, ranges and physical attributes
        waveAreaWidth: null, // {number} - width of the visible part of the lattice in the scene's units
        timeScaleFactor: null, // {number} - scale factor to convert seconds of wall time to time for the given scene
        waveSpeed: null, // {number}
        planeWaveGeneratorNodeText: null, // {string} - shown on the PlaneWaveGeneratorNode
        frequencyRange: null, // {Range}
        initialAmplitude: null, // {number}
        sourceSeparationRange: null, // {Range}

        // Slits configuration
        initialSlitSeparation: null, // {number}
        initialSlitWidth: null, // {number}
        slitWidthRange: null, // {number}
        slitSeparationRange: null, // {Range}

        // Graph properties
        graphTitle: null, // {string} - the title to the shown on the wave-area graph
        graphVerticalAxisLabel: null, // {string} text to show on the vertical axis on the wave-area graph
        graphHorizontalAxisLabel: null // {string} - text that describes the horizontal spatial axis
      }, config );

      // @public {WaveSpatialTypeEnum}
      this.waveSpatialType = Validator.validate( config.waveSpatialType, { validValues: WaveSpatialTypeEnum.VALUES } );

      // @public (read-only) {string} - units for this scene
      this.translatedPositionUnits = Validator.validate( config.translatedPositionUnits, VALID_STRING );

      // @public (read-only) {number} - width of the visible part of the lattice in the scene's units
      this.waveAreaWidth = Validator.validate( config.waveAreaWidth, POSITIVE_NUMBER );

      // @public (read-only) {string} - text that describes the horizontal spatial axis
      this.graphHorizontalAxisLabel = Validator.validate( config.graphHorizontalAxisLabel, VALID_STRING );

      // @public (read-only) {number} - length that depicts indicate relative scale, see LengthScaleIndicatorNode
      this.scaleIndicatorLength = Validator.validate( config.scaleIndicatorLength, POSITIVE_NUMBER );

      // @public (read-only) {string} - the units (in English and for the PhET-iO data stream)
      this.positionUnits = Validator.validate( config.positionUnits, VALID_STRING );

      // @public (read-only) {number} - scale factor to convert seconds of wall time to time for the given scene
      this.timeScaleFactor = Validator.validate( config.timeScaleFactor, POSITIVE_NUMBER );

      // @public (read-only) {string} - units for time, shown in the timer and optionally top right of the lattice
      this.timeUnits = Validator.validate( config.timeUnits, VALID_STRING );

      // @public (read-only) {string} text to show on the vertical axis on the wave-area graph
      this.graphVerticalAxisLabel = Validator.validate( config.graphVerticalAxisLabel, VALID_STRING );

      // @public (read-only) {string} - the title to the shown on the wave-area graph
      this.graphTitle = Validator.validate( config.graphTitle, VALID_STRING );

      // @public (read-only) {number}
      this.numberOfSources = Validator.validate( config.numberOfSources, { validValues: [ 1, 2 ] } );

      // @public (read-only) {number}
      this.waveSpeed = Validator.validate( config.waveSpeed, POSITIVE_NUMBER );

      // @public (read-only) {string} - displayed at the top right of the wave area
      this.timeScaleString = Validator.validate( config.timeScaleString, { valueType: 'string' } );

      // @public (read-only) {string} - shown on the PlaneWaveGeneratorNode
      this.planeWaveGeneratorNodeText = Validator.validate( config.planeWaveGeneratorNodeText, VALID_STRING );

      // These config values are used to create Property instances.
      const frequencyRange = Validator.validate( config.frequencyRange, VALID_RANGE );
      const initialSlitSeparation = Validator.validate( config.initialSlitSeparation, POSITIVE_NUMBER );
      const sourceSeparationRange = Validator.validate( config.sourceSeparationRange, VALID_RANGE );
      const initialSlitWidth = Validator.validate( config.initialSlitWidth, POSITIVE_NUMBER );
      const slitWidthRange = Validator.validate( config.slitWidthRange, VALID_RANGE );
      const slitSeparationRange = Validator.validate( config.slitSeparationRange, VALID_RANGE );
      const initialAmplitude = Validator.validate( config.initialAmplitude, POSITIVE_NUMBER );

      // @public the frequency in the appropriate units for the scene
      this.frequencyProperty = new NumberProperty( frequencyRange.getCenter(), { range: frequencyRange } );

      // @public distance between the sources in the units of the scene, or 0 if there is only one
      // source initialized to match the initial slit separation,
      // see https://github.com/phetsims/wave-interference/issues/87
      this.sourceSeparationProperty = new NumberProperty( initialSlitSeparation, {
        units: this.positionUnits,
        range: sourceSeparationRange
      } );

      // @public - width of the slit(s) opening in the units for this scene
      this.slitWidthProperty = new NumberProperty( initialSlitWidth, {
        units: this.positionUnits,
        range: slitWidthRange
      } );

      // @public distance between the center of the slits, in the units for this scene
      this.slitSeparationProperty = new NumberProperty( initialSlitSeparation, {
        units: this.positionUnits,
        range: slitSeparationRange
      } );

      // @public - controls the amplitude of the wave.
      this.amplitudeProperty = new NumberProperty( initialAmplitude, {
        range: WaveInterferenceConstants.AMPLITUDE_RANGE
      } );

      // @public - the grid that contains the wave values
      this.lattice = new Lattice(
        WaveInterferenceConstants.LATTICE_DIMENSION,
        WaveInterferenceConstants.LATTICE_DIMENSION,
        WaveInterferenceConstants.LATTICE_PADDING,
        WaveInterferenceConstants.LATTICE_PADDING
      );

      // @public - elapsed time in seconds
      this.timeProperty = new NumberProperty( 0 );

      // @public {number} phase of the wave generator
      this.phase = 0;

      // @private {number} - indicates the time when the pulse began, or 0 if there is no pulse.
      this.pulseStartTime = 0;

      // @public whether the button for the first source is pressed.  This is also used for the
      // slits screen plane wave source.
      this.button1PressedProperty = new BooleanProperty( false );

      // @public whether the button for the second source is pressed
      this.button2PressedProperty = new BooleanProperty( false );

      // @public (read-only) {string} - text to show to indicate the relative scale, see LengthScaleIndicatorNode
      this.scaleIndicatorText = StringUtils.fillIn( distanceUnitsString, {
        distance: this.scaleIndicatorLength,
        units: this.positionUnits
      } );

      // wavelength*frequency=wave speed
      phet.log && this.frequencyProperty.link( frequency =>
        phet.log( `f = ${frequency}/${this.timeUnits}, w = ${this.waveSpeed / frequency} ${this.positionUnits}` )
      );

      // @public (read-only) {string} - the unit to display on the WaveMeterNode, like "1 s"
      this.oneTimerUnit = StringUtils.fillIn( timeUnitsString, {
        time: 1,
        units: this.timeUnits
      } );

      // @public {ModelViewTransform2} - converts the model coordinates (in the units for this scene) to lattice
      // coordinates, does not include damping regions
      this.modelToLatticeTransform = ModelViewTransform2.createRectangleMapping(
        new Rectangle( 0, 0, this.waveAreaWidth, this.waveAreaWidth ),
        this.lattice.visibleBounds
      );

      // @public {ModelViewTransform2|null} - transforms from the physical units for this scene to view coordinates,
      // filled in after the view area is initialized, see setViewBounds
      this.modelViewTransform = null;

      // @public {ModelViewTransform2|null} - transforms from lattice coordinates to view coordinates, filled in after
      // the view area is initialized, see setViewBounds
      this.latticeToViewTransform = null;

      // @public - horizontal location of the barrier in lattice coordinates (includes damping region)
      // note: this is a floating point representation in 2D to work seamlessly with DragListener
      // lattice computations using this floating point value should use Util.roundSymmetric()
      // start slightly left of 50.5 so it will round to 50 instead of 51
      this.barrierLocationProperty = new Property( new Vector2( this.lattice.width / 2 - 1E-6, 0 ), {
        valueType: Vector2
      } );

      // @public {DerivedProperty.<number>} - lattice cell index of the continuous barrier location (x coordinate only)
      this.barrierLatticeCoordinateProperty = new DerivedProperty(
        [ this.barrierLocationProperty ],
        barrierLocation => Util.roundSymmetric( barrierLocation.x )
      );

      // @public - pulse or continuous
      this.disturbanceTypeProperty = new Property( DisturbanceTypeEnum.CONTINUOUS, {
        validValues: DisturbanceTypeEnum.VALUES
      } );

      // The first button can trigger a pulse, or continuous wave, depending on the disturbanceTypeProperty
      this.button1PressedProperty.lazyLink( isPressed => {
        this.handleButton1Toggled( isPressed );

        // Clear plane waves if the red button is deselected when paused.
        if ( this.waveSpatialType === WaveSpatialTypeEnum.PLANE && !isPressed ) {
          this.setSourceValues();
          this.lattice.changedEmitter.emit();
        }
      } );

      // The 2nd button starts the second continuous wave
      this.button2PressedProperty.lazyLink( isPressed => this.handleButton2Toggled( isPressed ) );

      // @public - true while a single pulse is being generated
      this.pulseFiringProperty = new BooleanProperty( false );

      // @public (read-only) - signify if a wave is about to start oscillating, see WaterScene
      this.isAboutToFireProperty = new BooleanProperty( false );

      // When the pulse ends, the button pops out
      this.pulseFiringProperty.lazyLink( pulseFiring => {
        if ( !pulseFiring ) {
          this.button1PressedProperty.value = false;
        }
      } );

      // @public (read-only) - the value of the wave at the oscillation point
      this.oscillator1Property = new NumberProperty( 0 );

      // @public (read-only) - the value of the wave at the oscillation point
      this.oscillator2Property = new NumberProperty( 0 );

      // @public - true when the first source is continuously oscillating
      this.continuousWave1OscillatingProperty = new BooleanProperty( false );

      // @public - true when the second source is continuously oscillating
      this.continuousWave2OscillatingProperty = new BooleanProperty( false );

      // @private
      this.temporalMask1 = new TemporalMask();

      // @private
      this.temporalMask2 = new TemporalMask();

      // @private
      this.stepIndex = 0;

      // When the user changes disturbance type, the button pops out and waves stop
      this.disturbanceTypeProperty.link( () => {
        this.button1PressedProperty.value = false;
        this.continuousWave1OscillatingProperty.value = false;
        this.continuousWave2OscillatingProperty.value = false;
      } );

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

        this.handlePhaseChanged();
      };
      this.frequencyProperty.lazyLink( phaseUpdate );

      // Everything below here is just for plane wave screen.
      if ( this.waveSpatialType === WaveSpatialTypeEnum.PLANE ) {

        // @public - type of the barrier in the lattice
        this.barrierTypeProperty = new Property( BarrierTypeEnum.ONE_SLIT, {
          validValues: BarrierTypeEnum.VALUES
        } );

        // When the barrier moves it creates a lot of artifacts, so clear the wave right of the barrier when it moves
        this.barrierLatticeCoordinateProperty.link( barrierLatticeCoordinate => {
          this.lattice.clearRight( barrierLatticeCoordinate );
        } );

        // @private {number} - phase of the wave so it doesn't start halfway through a cycle
        this.planeWavePhase = 0;

        // @protected {number} - record the time the button was pressed, so the SlitsModel can propagate the right
        // distance
        this.button1PressTime = 0;
        this.button1PressedProperty.link( pressed => {
          if ( pressed ) {
            this.button1PressTime = this.timeProperty.value;

            // See setSourceValues
            const frequency = this.frequencyProperty.get();
            const angularFrequency = frequency * Math.PI * 2;

            // Solve for - angularFrequency * this.timeProperty.value + phase = 0, making sure the phase matches 0 at
            // the edge, see https://github.com/phetsims/wave-interference/issues/207
            this.planeWavePhase = angularFrequency * this.timeProperty.value + Math.PI;
          }
          else {
            this.clear();
          }
        } );

        // When a barrier is added, clear the waves to the right instead of letting them dissipate,
        // see https://github.com/phetsims/wave-interference/issues/176
        this.barrierTypeProperty.link( barrierType => {
          this.clear();

          const frontTime = this.timeProperty.value - this.button1PressTime;
          const frontPosition = this.modelToLatticeTransform.modelToViewX( this.waveSpeed * frontTime );

          // if the wave had passed by the barrier, then repropagate from the barrier.  This requires back-computing the
          // time the button would have been pressed to propagate the wave to the barrier.  Hence this is the inverse of
          // the logic in setSourceValues
          const barrierLatticeX = this.barrierLatticeCoordinateProperty.value;
          if ( frontPosition > barrierLatticeX ) {
            const barrierModelX = this.modelToLatticeTransform.viewToModelX( barrierLatticeX );
            this.button1PressTime = this.timeProperty.value - barrierModelX / this.waveSpeed;
          }
        } );
      }
    }

    /**
     * Generate a wave from a point source
     * @param {number} amplitude
     * @param {number} time
     * @private
     */
    setPointSourceValues( amplitude, time ) {
      const frequency = this.frequencyProperty.get();
      const period = 1 / frequency;
      const timeSincePulseStarted = time - this.pulseStartTime;
      const lattice = this.lattice;
      const isContinuous = ( this.disturbanceTypeProperty.get() === DisturbanceTypeEnum.CONTINUOUS );
      const continuous1 = isContinuous && this.continuousWave1OscillatingProperty.get();
      const continuous2 = isContinuous && this.continuousWave2OscillatingProperty.get();

      // Used to compute whether a delta appears in either mask
      let temporalMask1Empty = true;
      let temporalMask2Empty = true;

      if ( continuous1 || continuous2 || this.pulseFiringProperty.get() ) {

        // The simulation is designed to start with a downward wave, corresponding to water splashing in
        const frequency = this.frequencyProperty.value;
        const angularFrequency = Math.PI * 2 * frequency;

        // For 50% longer than one pulse, keep the oscillator fixed at 0 to prevent "ringing"
        const waveValue = ( this.pulseFiringProperty.get() && timeSincePulseStarted > period ) ? 0 :
                          -Math.sin( time * angularFrequency + this.phase ) * amplitude;

        // Distance between the sources, or 0 if there is only 1 source
        const sourceSeparation = this.numberOfSources === 2 ? this.sourceSeparationProperty.get() : 0;

        // assumes a square lattice
        const separationInLatticeUnits = this.modelToLatticeTransform.modelToViewDeltaY( sourceSeparation / 2 );
        const distanceFromCenter = Util.roundSymmetric( separationInLatticeUnits );

        // Named with a "J" suffix instead of "Y" to remind us we are working in integral (i,j) lattice coordinates.
        // Use floor to get 50.5 => 50 instead of 51
        const latticeCenterJ = Math.floor( this.lattice.height / 2 );

        // Point source
        if ( this.continuousWave1OscillatingProperty.get() || this.pulseFiringProperty.get() ) {
          const j = latticeCenterJ + distanceFromCenter;
          lattice.setCurrentValue( WaveInterferenceConstants.POINT_SOURCE_HORIZONTAL_COORDINATE, j, waveValue );
          this.oscillator1Property.value = waveValue;
          this.temporalMask1.set( true, this.stepIndex, j );
          temporalMask1Empty = false;
        }

        // Secondary source (note if there is only one source, this sets the same value as above)
        if ( this.continuousWave2OscillatingProperty.get() ) {
          const j = latticeCenterJ - distanceFromCenter;
          lattice.setCurrentValue( WaveInterferenceConstants.POINT_SOURCE_HORIZONTAL_COORDINATE, j, waveValue );
          this.oscillator2Property.value = waveValue;
          this.temporalMask2.set( true, this.stepIndex, j );
          temporalMask2Empty = false;
        }
      }

      temporalMask1Empty && this.temporalMask1.set( false, this.stepIndex, 0 );
      temporalMask2Empty && this.temporalMask2.set( false, this.stepIndex, 0 );
    }

    /**
     * Generate a plane wave
     * @param {number} amplitude
     * @param {number} time
     * @private
     */
    setPlaneSourceValues( amplitude, time ) {
      const lattice = this.lattice;

      const barrierLatticeX = this.barrierTypeProperty.value === BarrierTypeEnum.NO_BARRIER ?
                              lattice.width - lattice.dampX :
                              this.barrierLatticeCoordinateProperty.value;
      const slitSeparationModel = this.slitSeparationProperty.get();

      const frontTime = time - this.button1PressTime;
      const frontPosition = this.modelToLatticeTransform.modelToViewX( this.waveSpeed * frontTime ); // in lattice coordinates

      const slitWidthModel = this.slitWidthProperty.get();
      const slitWidth = Util.roundSymmetric( this.modelToLatticeTransform.modelToViewDeltaY( slitWidthModel ) );
      const latticeCenterY = this.lattice.height / 2;

      // Take the desired frequency for the water scene, or the specified frequency of any other scene
      const frequency = this.frequencyProperty.get();
      const wavelength = this.getWavelength();

      // Solve for the wave number
      // lambda * k = 2 * pi
      // k = 2pi/lambda
      const k = Math.PI * 2 / wavelength;

      // Scale the amplitude because it is calibrated for a point source, not a plane wave
      const angularFrequency = frequency * Math.PI * 2;

      // Split into 2 regions.
      // 1. The region where there could be a wave (if it matches the button press and isn't in the barrier)
      // 2. The empirical part beyond the barrier

      // In the incoming region, set all lattice values to be an incoming plane wave.  This prevents any reflections
      // and unwanted artifacts, see https://github.com/phetsims/wave-interference/issues/47
      for ( let i = lattice.dampX; i <= barrierLatticeX; i++ ) {

        // Find the physical model coordinate corresponding to the lattice coordinate
        const x = this.modelToLatticeTransform.viewToModelX( i );

        for ( let j = 0; j < lattice.height; j++ ) {
          const y = this.modelToLatticeTransform.viewToModelY( j );

          // Zero out values in the barrier
          let isCellInBarrier = false;

          if ( i === barrierLatticeX ) {
            if ( this.barrierTypeProperty.value === BarrierTypeEnum.ONE_SLIT ) {
              const low = j > latticeCenterY + slitWidth / 2 - 0.5;
              const high = j < latticeCenterY - slitWidth / 2 - 0.5;
              isCellInBarrier = low || high;
            }
            else if ( this.barrierTypeProperty.value === BarrierTypeEnum.TWO_SLITS ) {

              // Spacing is between center of slits.  This computation is done in model coordinates
              const topBarrierWidth = ( this.waveAreaWidth - slitWidthModel - slitSeparationModel ) / 2;
              const centralBarrierWidth = this.waveAreaWidth - 2 * topBarrierWidth - 2 * slitWidthModel;
              const inTop = y <= topBarrierWidth;
              const inBottom = y >= this.waveAreaWidth - topBarrierWidth;
              const inCenter = ( y >= topBarrierWidth + slitWidthModel ) &&
                               ( y <= topBarrierWidth + slitWidthModel + centralBarrierWidth );
              isCellInBarrier = inTop || inBottom || inCenter;
            }
          }
          if ( this.button1PressedProperty.get() && !isCellInBarrier ) {

            // If the coordinate is past where the front of the wave would be, then zero it out.
            if ( i >= frontPosition ) {
              lattice.setCurrentValue( i, j, 0 );
              lattice.setLastValue( i, j, 0 );
            }
            else {
              const value = amplitude * PLANE_WAVE_MAGNITUDE
                            * Math.sin( k * x - angularFrequency * time + this.planeWavePhase );
              lattice.setCurrentValue( i, j, value );
              lattice.setLastValue( i, j, value );
            }
          }
          else {

            // Instantly clear the incoming wave, otherwise there are too many reflections
            lattice.setCurrentValue( i, j, 0 );
            lattice.setLastValue( i, j, 0 );
          }
        }
      }
    }

    /**
     * Set the incoming source values, in this case it is a point source near the left side of the lattice (outside of
     * the damping region).
     * @private
     */
    setSourceValues() {

      // Get the desired amplitude.  For water, this is set through the desiredAmplitudeProperty.  For other
      // scenes, this is set through the amplitudeProperty.
      const amplitude = this.desiredAmplitudeProperty ? this.desiredAmplitudeProperty.get() : this.amplitudeProperty.get();
      const time = this.timeProperty.value;
      if ( this.waveSpatialType === WaveSpatialTypeEnum.POINT ) {
        this.setPointSourceValues( amplitude, time );
      }
      else {
        this.setPlaneSourceValues( amplitude, time );
      }
    }

    /**
     * Additionally called from the "step" button
     * @param {number} wallDT - amount of wall time that passed, will be scaled by time scaling value
     * @param {boolean} manualStep - true if the step button is being pressed
     * @public
     */
    advanceTime( wallDT, manualStep ) {

      const frequency = this.frequencyProperty.get();
      const period = 1 / frequency;

      const dt = wallDT * this.timeScaleFactor;
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
      this.lattice.step();

      // Apply values on top of the computed lattice values so there is no noise at the point sources
      this.setSourceValues();

      // Scene-specific physics updates
      this.step( dt );

      // Apply temporal masking, but only for point sources.  Plane waves already clear the wave area when changing
      // parameters
      if ( this.waveSpatialType === WaveSpatialTypeEnum.POINT ) {
        this.applyTemporalMask();
      }

      // Notify listeners about changes
      this.lattice.changedEmitter.emit();

      this.stepIndex++;
    }

    /**
     * By recording the times and positions of the wave disturbances, and knowing the wave propagation speed,
     * we can apply a masking function across the wave area, zeroing out any cell that could note have been generated
     * from the source disturbance.  This filters out spurious noise and restores "black" for the light scene.
     *
     * @private
     */
    applyTemporalMask() {

      // zero out values that are outside of the mask
      for ( let i = 0; i < this.lattice.width; i++ ) {
        for ( let j = 0; j < this.lattice.height; j++ ) {

          const cameFrom1 = this.temporalMask1.matches( i, j, this.stepIndex );
          const cameFrom2 = this.temporalMask2.matches( i, j, this.stepIndex );

          if ( !cameFrom1 && !cameFrom2 ) {
            this.lattice.clearCell( i, j );
          }
        }
      }

      // Prune entries.  Elements that are too far out of range are eliminated.  Use the diagonal of the lattice for the
      // max distance
      this.temporalMask1.prune( Math.sqrt( 2 ) * this.lattice.width, this.stepIndex );
      this.temporalMask2.prune( Math.sqrt( 2 ) * this.lattice.width, this.stepIndex );
    }

    /**
     * Clears the wave values
     * @public
     */
    clear() {
      this.lattice.clear();
      this.temporalMask1.clear();
      this.temporalMask2.clear();
    }

    /**
     * Start the sine argument at 0 so it will smoothly form the first wave.
     * @private
     */
    resetPhase() {
      const frequency = this.frequencyProperty.get();
      const angularFrequency = Math.PI * 2 * frequency;

      // Solve for the sin arg = 0 in Math.sin( this.time * angularFrequency + this.phase )
      this.phase = -this.timeProperty.value * angularFrequency;
    }

    /**
     * Returns the wavelength in the units of the scene
     * @returns {number}
     * @public
     */
    getWavelength() {
      return this.waveSpeed / this.frequencyProperty.get();
    }

    /**
     * Returns a Bounds2 for the visible part of the wave area, in the coordinates of the scene.
     * @returns {Bounds2} the lattice model bounds, in the coordinates of this scene.
     * @public
     */
    getWaveAreaBounds() {
      return new Bounds2( 0, 0, this.waveAreaWidth, this.waveAreaWidth );
    }

    /**
     * The user has initiated a single pulse.
     * @public
     */
    startPulse() {
      assert && assert( !this.pulseFiringProperty.value, 'Cannot fire a pulse while a pulse is already being fired' );
      this.resetPhase();
      this.pulseFiringProperty.value = true;
      this.pulseStartTime = this.timeProperty.value;
    }

    /**
     * Called when the primary button is toggled.  Can be overriden for scene-specific behavior.
     * @param {boolean} isPressed
     * @protected
     */
    handleButton1Toggled( isPressed ) {
      if ( isPressed && !this.button2PressedProperty.value ) {
        this.resetPhase();
      }
      if ( isPressed && this.disturbanceTypeProperty.value === DisturbanceTypeEnum.PULSE ) {
        this.startPulse();
      }
      else {

        // Water propagates via the water drop
        this.continuousWave1OscillatingProperty.value = isPressed;
      }
    }

    /**
     * Called when the secondary button is toggled.  Can be overriden for scene-specific behavior.
     * @param {boolean} isPressed
     * @protected
     */
    handleButton2Toggled( isPressed ) {
      if ( isPressed && !this.button1PressedProperty.value ) {
        this.resetPhase();
      }
      this.continuousWave2OscillatingProperty.value = isPressed;
    }

    /**
     * No-op which may be overriden for scene-specific behavior.  Called when the phase changes.
     * @protected
     */
    handlePhaseChanged() {
    }

    /**
     * Restores the initial conditions of this scene.
     * @public
     */
    reset() {
      this.clear();
      this.frequencyProperty.reset();
      this.slitWidthProperty.reset();
      this.barrierLocationProperty.reset();
      this.slitSeparationProperty.reset();
      this.sourceSeparationProperty.reset();
      this.amplitudeProperty.reset();
      this.disturbanceTypeProperty.reset();
      this.button1PressedProperty.reset();
      this.button2PressedProperty.reset();
      this.oscillator1Property.reset();
      this.oscillator2Property.reset();
      this.continuousWave1OscillatingProperty.reset();
      this.continuousWave2OscillatingProperty.reset();
      this.isAboutToFireProperty.reset();
      this.barrierTypeProperty && this.barrierTypeProperty.reset();
    }

    /**
     * Move forward in time by the specified amount
     * @param {number} dt - amount of time to move forward, in the units of the scene
     * @public
     */
    step( dt ) {

      // No-op here, subclasses can override to provide behavior.
    }

    /**
     * After the view is initialized, determine the coordinate transformations that map to view coordinates.
     * @param {Bounds2} viewBounds
     * @public
     */
    setViewBounds( viewBounds ) {
      assert && assert( this.modelViewTransform === null, 'setViewBounds cannot be called twice' );

      this.modelViewTransform = ModelViewTransform2.createRectangleMapping(
        this.getWaveAreaBounds(),
        viewBounds
      );

      const latticeBounds = new Bounds2( 0, 0, 1, 1 );
      const modelBounds = this.modelToLatticeTransform.viewToModelBounds( latticeBounds );
      const tempViewBounds = this.modelViewTransform.modelToViewBounds( modelBounds );

      this.latticeToViewTransform = ModelViewTransform2.createRectangleMapping( latticeBounds, tempViewBounds );
    }
  }

  return waveInterference.register( 'Scene', Scene );
} );