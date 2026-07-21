import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import connectDB from './src/config/db.js'
import User from './src/models/User.js'
import Note from './src/models/Note.js'
import Comment from './src/models/Comment.js'

const SAMPLE_USERS = [
  { name: 'Rahul Sharma', email: 'rahul@example.com', password: 'password123', university: 'Anna University', course: 'B.Tech / B.E.', contributionScore: 42, role: 'user' },
  { name: 'Priya Patel', email: 'priya@example.com', password: 'password123', university: 'Mumbai University', course: 'M.Sc', contributionScore: 28, role: 'user' },
  { name: 'Amit Kumar', email: 'amit@example.com', password: 'password123', university: 'VTU', course: 'B.Tech / B.E.', contributionScore: 15, role: 'user' },
  { name: 'Sneha Reddy', email: 'sneha@example.com', password: 'password123', university: 'Osmania University', course: 'BCA', contributionScore: 8, role: 'user' },
  { name: 'Admin User', email: 'admin@pustaklab.com', password: 'admin123456', university: 'Pustak Lab HQ', course: 'N/A', contributionScore: 100, role: 'admin' },
]

const SAMPLE_NOTES = (users) => [
  {
    title: 'Data Structures & Algorithms — Complete Unit 3 Notes',
    description: 'Comprehensive handwritten notes covering Trees, Graphs, BFS, DFS, Heaps, and Sorting algorithms. Includes worked examples and time complexity analysis for all major algorithms.',
    university: 'Anna University',
    course: 'B.Tech / B.E.',
    subject: 'Data Structures & Algorithms',
    semester: '3rd Semester',
    materialType: 'Notes',
    tags: ['unit-3', 'trees', 'graphs', 'bfs', 'dfs', 'handwritten', 'cs'],
    fileUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF2.pdf',
    filePath: 'notes/sample-dsa.pdf',
    fileSize: 2048000,
    fileType: 'application/pdf',
    fileHash: 'sample_hash_1',
    uploadedBy: users[0]._id,
    status: 'approved',
    downloadCount: 342,
    viewCount: 1240,
  },
  {
    title: 'Database Management Systems — ER Diagrams & SQL Queries',
    description: 'Complete notes on Entity-Relationship diagrams, normalization (1NF to BCNF), SQL joins, stored procedures, triggers, and transaction management. Perfect for university exams.',
    university: 'Mumbai University',
    course: 'B.Tech / B.E.',
    subject: 'Database Management Systems',
    semester: '4th Semester',
    materialType: 'Notes',
    tags: ['dbms', 'sql', 'er-diagram', 'normalization', 'transactions'],
    fileUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF2.pdf',
    filePath: 'notes/sample-dbms.pdf',
    fileSize: 3145728,
    fileType: 'application/pdf',
    fileHash: 'sample_hash_2',
    uploadedBy: users[1]._id,
    status: 'approved',
    downloadCount: 215,
    viewCount: 890,
  },
  {
    title: 'Operating Systems — 2024 Previous Year Question Papers',
    description: 'Collection of 5 years of OS question papers from VTU with answers. Covers process scheduling, memory management, file systems, and deadlocks.',
    university: 'VTU',
    course: 'B.Tech / B.E.',
    subject: 'Operating Systems',
    semester: '5th Semester',
    materialType: 'Question Paper',
    tags: ['os', 'question-paper', '2024', 'vtu', 'previous-year', 'scheduling'],
    fileUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF2.pdf',
    filePath: 'notes/sample-os-qp.pdf',
    fileSize: 1572864,
    fileType: 'application/pdf',
    fileHash: 'sample_hash_3',
    uploadedBy: users[2]._id,
    status: 'approved',
    downloadCount: 489,
    viewCount: 2100,
  },
  {
    title: 'Computer Networks — Quick Reference Cheat Sheet',
    description: 'One-page cheat sheet covering all OSI layers, TCP/IP stack, protocols (HTTP, DNS, DHCP, FTP), subnetting formulas, and common port numbers. Great for last-minute revision!',
    university: 'Osmania University',
    course: 'B.Tech / B.E.',
    subject: 'Computer Networks',
    semester: '6th Semester',
    materialType: 'Cheat Sheet',
    tags: ['cn', 'cheat-sheet', 'osi', 'tcp-ip', 'protocols', 'revision'],
    fileUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF2.pdf',
    filePath: 'notes/sample-cn-cheat.pdf',
    fileSize: 512000,
    fileType: 'application/pdf',
    fileHash: 'sample_hash_4',
    uploadedBy: users[3]._id,
    status: 'approved',
    downloadCount: 621,
    viewCount: 3200,
  },
  {
    title: 'Digital Electronics — Lab Manual with Experiments',
    description: 'Complete lab manual for Digital Electronics covering all 12 experiments: Logic Gates, Flip-Flops, Counters, Multiplexers, Adders, and more. Includes circuit diagrams, truth tables, and viva questions.',
    university: 'Anna University',
    course: 'B.Tech / B.E.',
    subject: 'Digital Electronics',
    semester: '2nd Semester',
    materialType: 'Lab Manual',
    tags: ['digital-electronics', 'lab', 'logic-gates', 'flip-flops', 'counters'],
    fileUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF2.pdf',
    filePath: 'notes/sample-de-lab.pdf',
    fileSize: 4194304,
    fileType: 'application/pdf',
    fileHash: 'sample_hash_5',
    uploadedBy: users[0]._id,
    status: 'approved',
    downloadCount: 178,
    viewCount: 720,
  },
  {
    title: 'Machine Learning — Assignment 2: Classification Algorithms',
    description: 'Solved assignment on Naive Bayes, Decision Trees, Random Forest, and SVM classifiers with Python implementation using scikit-learn. Includes accuracy comparison and confusion matrices.',
    university: 'Mumbai University',
    course: 'M.Sc',
    subject: 'Machine Learning',
    semester: '1st Semester',
    materialType: 'Assignment',
    tags: ['ml', 'assignment', 'naive-bayes', 'svm', 'python', 'classification'],
    fileUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF2.pdf',
    filePath: 'notes/sample-ml-assign.pdf',
    fileSize: 2621440,
    fileType: 'application/pdf',
    fileHash: 'sample_hash_6',
    uploadedBy: users[1]._id,
    status: 'approved',
    downloadCount: 134,
    viewCount: 560,
  },
  {
    title: 'Engineering Mathematics — Laplace Transforms & Fourier Series',
    description: 'Detailed notes on Laplace Transforms, inverse Laplace, Fourier Series, Fourier transforms, and their applications in signal processing. Solved problems from university exams included.',
    university: 'VTU',
    course: 'B.Tech / B.E.',
    subject: 'Engineering Mathematics',
    semester: '2nd Semester',
    materialType: 'Notes',
    tags: ['maths', 'laplace', 'fourier', 'transforms', 'unit-4'],
    fileUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF2.pdf',
    filePath: 'notes/sample-maths.pdf',
    fileSize: 3670016,
    fileType: 'application/pdf',
    fileHash: 'sample_hash_7',
    uploadedBy: users[2]._id,
    status: 'approved',
    downloadCount: 267,
    viewCount: 1100,
  },
  {
    title: 'Software Engineering — Midterm Exam 2024 Paper',
    description: 'Midterm question paper from 2024 covering Software Development Life Cycle (SDLC), Agile methodologies, UML diagrams, software testing approaches, and project management basics.',
    university: 'Osmania University',
    course: 'BCA',
    subject: 'Software Engineering',
    semester: '5th Semester',
    materialType: 'Question Paper',
    tags: ['se', 'midterm', '2024', 'sdlc', 'agile', 'uml', 'testing'],
    fileUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF2.pdf',
    filePath: 'notes/sample-se-midterm.pdf',
    fileSize: 768000,
    fileType: 'application/pdf',
    fileHash: 'sample_hash_8',
    uploadedBy: users[3]._id,
    status: 'approved',
    downloadCount: 312,
    viewCount: 1450,
  },
  {
    title: 'Web Technologies — HTML, CSS, JavaScript Quick Reference',
    description: 'Comprehensive cheat sheet for web development: HTML5 semantic tags, CSS flexbox/grid reference, JavaScript ES6+ features, DOM manipulation, and AJAX. Perfect for practical exams.',
    university: 'Anna University',
    course: 'BCA',
    subject: 'Web Technologies',
    semester: '4th Semester',
    materialType: 'Cheat Sheet',
    tags: ['web', 'html', 'css', 'javascript', 'cheat-sheet', 'practical'],
    fileUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF2.pdf',
    filePath: 'notes/sample-web.pdf',
    fileSize: 614400,
    fileType: 'application/pdf',
    fileHash: 'sample_hash_9',
    uploadedBy: users[0]._id,
    status: 'approved',
    downloadCount: 445,
    viewCount: 1890,
  },
  {
    title: 'Computer Architecture — Unit 5: Memory Hierarchy & Cache',
    description: 'Detailed notes on memory hierarchy (registers, cache, RAM, disk), cache mapping techniques (direct, associative, set-associative), write policies, and virtual memory concepts.',
    university: 'Mumbai University',
    course: 'B.Tech / B.E.',
    subject: 'Computer Architecture',
    semester: '4th Semester',
    materialType: 'Notes',
    tags: ['ca', 'cache', 'memory', 'unit-5', 'virtual-memory', 'architecture'],
    fileUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF2.pdf',
    filePath: 'notes/sample-ca.pdf',
    fileSize: 2097152,
    fileType: 'application/pdf',
    fileHash: 'sample_hash_10',
    uploadedBy: users[1]._id,
    status: 'approved',
    downloadCount: 189,
    viewCount: 780,
  },
]

const seed = async () => {
  try {
    await connectDB()
    console.log('\n🌱 Starting database seed...\n')

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Note.deleteMany({}),
      Comment.deleteMany({}),
    ])
    console.log('🗑️  Cleared existing data')

    // Create users
    const createdUsers = []
    for (const userData of SAMPLE_USERS) {
      const { password, ...rest } = userData
      const user = new User({ ...rest, passwordHash: password })
      await user.save()
      createdUsers.push(user)
      console.log(`✅ Created user: ${user.name} (${user.role})`)
    }

    // Create notes
    const noteData = SAMPLE_NOTES(createdUsers)
    const createdNotes = await Note.insertMany(noteData)
    console.log(`\n✅ Created ${createdNotes.length} sample notes`)

    // Add some upvotes
    createdNotes[0].upvotes = [createdUsers[1]._id, createdUsers[2]._id, createdUsers[3]._id]
    createdNotes[2].upvotes = [createdUsers[0]._id, createdUsers[1]._id]
    createdNotes[3].upvotes = [createdUsers[0]._id, createdUsers[2]._id, createdUsers[3]._id]
    await Promise.all([createdNotes[0].save(), createdNotes[2].save(), createdNotes[3].save()])

    // Add sample comments
    await Comment.insertMany([
      { noteId: createdNotes[0]._id, userId: createdUsers[1]._id, text: 'These notes saved my exam! The BFS/DFS examples are super clear. Thank you!' },
      { noteId: createdNotes[0]._id, userId: createdUsers[2]._id, text: 'Can you also upload Unit 4 notes? This is amazing!' },
      { noteId: createdNotes[2]._id, userId: createdUsers[0]._id, text: 'Do these include the 2023 papers as well?' },
      { noteId: createdNotes[3]._id, userId: createdUsers[1]._id, text: 'This cheat sheet is exactly what I needed before the exam! 🙌' },
    ])
    console.log('✅ Added sample comments')

    console.log('\n✅ Seed completed successfully!')
    console.log('\n📋 Test Accounts:')
    console.log('   Student: rahul@example.com / password123')
    console.log('   Admin:   admin@pustaklab.com / admin123456')
    console.log('\nAll users can log in with password: password123\n')

    process.exit(0)
  } catch (err) {
    console.error('❌ Seed failed:', err.message)
    process.exit(1)
  }
}

seed()
