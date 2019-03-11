// Copyright 2017-2019, University of Colorado Boulder

/**
 * Model for the Diffraction screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Complex = require( 'DOT/Complex' );
  const EllipseScene = require( 'WAVE_INTERFERENCE/diffraction/model/EllipseScene' );
  const Enumeration = require( 'PHET_CORE/Enumeration' );
  const Matrix = require( 'DOT/Matrix' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Property = require( 'AXON/Property' );
  const Range = require( 'DOT/Range' );
  const RectangleScene = require( 'WAVE_INTERFERENCE/diffraction/model/RectangleScene' );
  const VisibleColor = require( 'SCENERY_PHET/VisibleColor' );
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  const WaveInterferenceConstants = require( 'WAVE_INTERFERENCE/common/WaveInterferenceConstants' );

  // constants
  const CONTRAST = 0.01;
  const DEFAULT_WAVELENGTH = ( VisibleColor.MIN_WAVELENGTH + VisibleColor.MAX_WAVELENGTH ) / 2;
  const MATRIX_DIMENSION = WaveInterferenceConstants.DIFFRACTION_MATRIX_DIMENSION;

  // preallocated once to avoid generating garbage
  const SCRATCH_SHIFTED = new Array( MATRIX_DIMENSION * MATRIX_DIMENSION );
  const im = new Array( MATRIX_DIMENSION * MATRIX_DIMENSION );
  const re = new Array( MATRIX_DIMENSION * MATRIX_DIMENSION );
  FFT.init( MATRIX_DIMENSION );

  class DiffractionModel {
    constructor() {

      // @public - whether the laser is emitting light
      this.onProperty = new BooleanProperty( true );

      // @public - the wavelength of the laser in nm
      this.wavelengthProperty = new NumberProperty( DEFAULT_WAVELENGTH, {
        range: new Range( VisibleColor.MIN_WAVELENGTH, VisibleColor.MAX_WAVELENGTH )
      } );

      // @public
      this.ellipseScene = new EllipseScene();

      // @public
      this.rectangleScene = new RectangleScene();

      // @public characteristics of the grating
      this.numberOfLinesProperty = new NumberProperty( 10, {
        range: new Range( 2, 200 )
      } );
      this.angleProperty = new NumberProperty( 0, {
        range: new Range( 0, Math.PI * 2 )
      } );

      this.sceneProperty = new Property( DiffractionModel.ApertureType.RECTANGLE, {
        validValues: DiffractionModel.ApertureType.VALUES
      } );

      this.scenes = [ this.ellipseScene, this.rectangleScene ];

      // @public - selected aperture type, which is in essence the "scene" for this screen.
      this.sceneProperty = new Property( this.ellipseScene, {
        validValues: this.scenes
      } );

      // The displayed aperture, shared by all scenes
      this.apertureMatrix = new Matrix( MATRIX_DIMENSION, MATRIX_DIMENSION );

      // Transformed aperture to account for wavelength changes for the FFT, shared by all scenes
      this.scaledApertureMatrix = new Matrix( MATRIX_DIMENSION, MATRIX_DIMENSION );

      // Result of FFT on the scaledApertureMatrix, shared by all scenes
      this.diffractionMatrix = new Matrix( MATRIX_DIMENSION, MATRIX_DIMENSION );

      const update = () => {

        // clear before drawing
        this.apertureMatrix.timesEquals( 0 );
        this.scaledApertureMatrix.timesEquals( 0 );

        const scaleDifference = ( this.wavelengthProperty.value - DEFAULT_WAVELENGTH ) / DEFAULT_WAVELENGTH;

        // More frequency => more diffraction
        const scaleFactor = 1 - scaleDifference * 2;
        const scene = this.sceneProperty.value;
        scene.paintMatrix( this.apertureMatrix, 1 );
        scene.paintMatrix( this.scaledApertureMatrix, scaleFactor );
        DiffractionModel.fftImageProcessingLabs( this.scaledApertureMatrix, this.diffractionMatrix );
      };
      this.scenes.forEach( scene => scene.link( update ) );
      this.sceneProperty.link( update );
      this.wavelengthProperty.link( update );
    }

    /**
     * @public
     */
    reset() {
      this.scenes.forEach( scene => scene.reset() );
      this.onProperty.reset();
      this.numberOfLinesProperty.reset();
      this.angleProperty.reset();
      this.sceneProperty.reset();
    }
  }

  /**
   * An aperture can be circular (CIRCLE), rectangular (RECTANGLE), or an array of slits (SLITS).
   * @public
   */
  DiffractionModel.ApertureType = new Enumeration( [ 'CIRCLE', 'RECTANGLE', 'SLITS' ] );

  DiffractionModel.getPlainArray = matrix => {
    const x = [];
    for ( let i = 0; i < matrix.size; i++ ) {
      x[ i ] = matrix.entries[ i ];
    }
    return x;
  };

  DiffractionModel.getFloat32Array = matrix => {
    const x = new Float32Array( matrix.getColumnDimension() * matrix.getRowDimension() );
    for ( let i = 0; i < matrix.size; i++ ) {
      x[ i ] = matrix.entries[ i ];
    }
    return x;
  };

  /**
   * Given row/column indices, find the index in the flattened array.  Uses the same strategy as DOT/Matrix.
   * @param {number} i - row index
   * @param {number} j - column index
   * @returns {number} - array index
   */
  const getIndex = ( i, j ) => {
    return i * MATRIX_DIMENSION + j;
  };

  /**
   * @param {Matrix} input
   * @param {Matrix} output - to set resultant values to
   */
  DiffractionModel.fftImageProcessingLabs = ( input, output ) => {

    for ( let i = 0; i < input.entries.length; i++ ) {
      re[ i ] = input.entries[ i ];
      im[ i ] = 0;
    }

    // TODO: supply input.entries as re?
    FFT.fft2d( re, im );

    // TODO: inline this or don't allocate.  Also, should we be creating Complex all the time?
    const result = [];
    for ( let i = 0; i < re.length; i++ ) {
      result[ i ] = new Complex( re[ i ], im[ i ] );
    }

    // From https://www.cs.cmu.edu/afs/andrew/scs/cs/15-463/2001/pub/www/notes/fourier/fourier.pdf
    // Practical issues: For display purposes, you probably want to cyclically translate the picture so that pixel (0,0), which now contains frequency (ωx, ωy ) = (0, 0), moves to the center
    // of the image. And you probably want to display pixel values proportional to log(magnitude)
    // of each complex number (this looks more interesting than just magnitude). For color images, do the above to each of the three channels (R, G, and B) independently.

    for ( let row = 0; row < MATRIX_DIMENSION; row++ ) {
      for ( let col = 0; col < MATRIX_DIMENSION; col++ ) {
        const sourceIndex = getIndex( row, col );
        const destinationIndex = getIndex(
          ( row + MATRIX_DIMENSION / 2 ) % MATRIX_DIMENSION,
          ( col + MATRIX_DIMENSION / 2 ) % MATRIX_DIMENSION
        );
        SCRATCH_SHIFTED[ destinationIndex ] = result[ sourceIndex ];
      }
    }

    // get the largest magnitude
    let maxMagnitude = 0;
    for ( let i = 0; i < SCRATCH_SHIFTED.length; i++ ) {
      if ( SCRATCH_SHIFTED[ i ].magnitude > maxMagnitude ) {
        maxMagnitude = SCRATCH_SHIFTED[ i ].magnitude;
      }
    }

    // draw the pixels
    const logOfMaxMag = Math.log( CONTRAST * maxMagnitude + 1 );

    for ( let i = 0; i < SCRATCH_SHIFTED.length; i++ ) {
      output.entries[ i ] = Math.log( CONTRAST * SCRATCH_SHIFTED[ i ].magnitude + 1 ) / logOfMaxMag;
    }
  };

  return waveInterference.register( 'DiffractionModel', DiffractionModel );
} );