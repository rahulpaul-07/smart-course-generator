import React, { useState } from 'react';

export default function FlashcardTestPage() {
  const [flipped, setFlipped] = useState(false);

  return (
    <div style={{ padding: '50px', background: '#fff', minHeight: '100vh', color: '#000' }}>
      <h1>Isolated Flashcard Test</h1>
      
      <button 
        type="button"
        className="scene focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        onClick={() => setFlipped(!flipped)}
        style={{
          border: '5px solid red',
          perspective: '1000px',
          width: '300px',
          height: '200px',
          margin: '50px auto',
          cursor: 'pointer',
          background: 'none',
          padding: 0,
          display: 'block'
        }}
      >
        <div 
          className="card"
          style={{
            border: '5px solid red',
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s ease',
            transform: flipped ? 'rotateY(180deg)' : 'none'
          }}
        >
          <div 
            className="card__face card__face--front"
            style={{
              border: '5px solid red',
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
              background: '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              boxSizing: 'border-box'
            }}
          >
            <h2>Question: What is React?</h2>
          </div>
          
          <div 
            className="card__face card__face--back"
            style={{
              border: '5px solid red',
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: '#c0c0c0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              boxSizing: 'border-box'
            }}
          >
            <p>Answer: React is a JavaScript library for building user interfaces.</p>
          </div>
        </div>
      </button>
    </div>
  );
}
