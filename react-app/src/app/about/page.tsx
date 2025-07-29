'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function AboutPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const getTheme = () => {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        const attrTheme = document.documentElement.getAttribute('data-theme');
        if (attrTheme === 'dark' || attrTheme === 'light') setTheme(attrTheme);
      }
    };
    
    getTheme();
    
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      getTheme();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    window.dispatchEvent(new Event('locomotive-update'));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16" data-scroll-section style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
      <h1 className="text-4xl font-medium mb-8 saans" data-scroll data-scroll-speed="0.5" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
        About Me
      </h1>
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-1/3">
          <div 
            className="relative aspect-square rounded-lg overflow-hidden"
            style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6' }}
          >
            <Image
              src="/assets/images/profile.jpg"
              alt="David Holcer"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
        <div className="w-full md:w-2/3">
          <p className="text-lg mb-6" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
            Hey! 👋 I'm David Holcer, a recent graduate from McGill University in Montreal, QC with a B.Sc. in Mathematics and Computer Science. I am interested in the world of data science, generative art, and front-end development. I'm constantly looking for new technologies to learn and implement within my personal projects.
          </p>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-medium mb-2 saans" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                📍 Current Endeavors
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium saans" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                    🤖 Data Science & AI
                  </h3>
                  <p style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                    As a Data Science Researcher, I innovated next-gen techniques around social media bot creation and detection. I'm dedicated to exploring the impact of artificial intelligence in both applied and experimental contexts.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                    🎨 Generative Art & Design
                  </h3>
                  <p style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                    I love creating art through code. Teaching p5.js workshops and sharing interactive visualizations has been incredibly fulfilling—I get to blend creativity with math and tech, showing people just how expressive we can be with code. Generative art has become a core part of my journey, where p5.js, JavaScript, and Processing allow me to bring data-driven visualizations and abstract ideas to life.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                    👨‍💻 Software Development
                  </h3>
                  <p style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                    I've developed sentiment analysis tools, playlist cover art generators, and interactive storytelling platforms, all powered by advanced APIs and my coding expertise. Bringing unique ideas to life through code is my favourite kind of challenge.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-medium mb-2" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                Why I Do It
              </h2>
              <p style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                I've become captivated by the connection between creativity and technology. Finding those little sparks of eureka in writing clean code, modelling a concept with mathematical formulas, or learning an intriguing new data science algorithm keeps me hooked. I search for meaning and connections between seemingly unrelated concepts and aim to bridge them through exploration and experimentation.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-medium mb-2" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                🌟 Experience Highlights
              </h2>
              <ul className="list-disc pl-6 space-y-2" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                <li><strong>Tutoring & Teaching:</strong> I have helped over 20 students become proficient in mathematics and computer science from Calculus to Linear Algebra, I enjoy spreading my joy in learning complex concepts.</li>
                <li><strong>Research:</strong> My bioinformatics research on DNA data compression employing a novel Markov Chain clustering algorithm.</li>
                <li><strong>Projects:</strong> From Coverify.ai to StoryWeaver.ai, my project portfolio reflects my commitment to developing dynamic front-end solutions, creating data visualizations, and enhancing user experiences with innovative APIs.</li>
                <li><strong>Fun Facts:</strong> When I'm not coding, you'll find me cooking something new, climbing, playing the piano, snapping photos, or enjoying a quick game of chess.</li>
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <p className="mb-4" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
              Take a look around, and feel free to reach out. It makes my day when I get to connect and chat over shared interests.
            </p>
            <a
              href="/assets/documents/resume.pdf"
              download
              className="inline-block px-6 py-3 rounded-lg transition-colors"
              style={{
                backgroundColor: theme === 'dark' ? '#ffffff' : '#000000',
                color: theme === 'dark' ? '#000000' : '#ffffff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#f3f4f6' : '#1f2937';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#ffffff' : '#000000';
              }}
            >
              Download Résumé
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 