# Performance Typewriter

A modern typewriter application for performance use, built with React, Vite, and Electron.

## Features

- **Visual Key Display**: Large key indicators appear on screen when typing
- **Audio Feedback**: Realistic typewriter sounds with alternating type sounds
- **Special Key Sounds**: 
  - Regular keys: Alternating type1.mp3, type2.mp3, type3.mp3
  - Enter key: bell.mp3 
  - Space bar: winding.mp3
- **Modern UI**: Vercel-inspired dark theme design
- **Cross-platform**: Available as desktop app via Electron

## Development

### Web Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for web
npm run build
```

### Electron Development
```bash
# Start Electron in development mode
npm run electron-dev

# Build and run Electron
npm run electron-build

# Build distributables
npm run dist          # All platforms
npm run dist-mac      # macOS
npm run dist-win      # Windows  
npm run dist-linux    # Linux
```

## Sound Files

Place the following MP3 files in `public/sounds/`:

- `type1.mp3` - First typewriter sound
- `type2.mp3` - Second typewriter sound  
- `type3.mp3` - Third typewriter sound
- `bell.mp3` - Bell sound for Enter key
- `winding.mp3` - Winding sound for Space bar

The app will work without sound files but won't produce audio feedback.

## Usage

1. **Web Version**: Open in browser and start typing
2. **Desktop App**: Launch the Electron app and start typing
3. **Key Mapping**:
   - Any letter/number: Cycles through type sounds
   - Enter: Bell sound
   - Space: Winding sound
   - Backspace: Type sound

## Tech Stack

- **Frontend**: React 19, Vite
- **Desktop**: Electron
- **Audio**: Web Audio API
- **Styling**: Modern CSS with Inter font

## Building

The app can be built for multiple platforms:

- **macOS**: DMG installer (Intel & Apple Silicon)
- **Windows**: NSIS installer (x64)
- **Linux**: AppImage (x64)

## License

MIT License