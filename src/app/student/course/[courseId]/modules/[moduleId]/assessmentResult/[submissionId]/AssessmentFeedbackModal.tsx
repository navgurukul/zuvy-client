// import React, { useState } from 'react'
// import { X, ChevronDown, ChevronUp, Sparkles, Code, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react'

// const AssessmentFeedbackModal = () => {
//   const [isOpen, setIsOpen] = useState(false)
//   const [expandedCoding, setExpandedCoding] = useState<number | null>(null)
//   const [expandedMCQ, setExpandedMCQ] = useState<number | null>(null)

//   const toggleCodingQuestion = (index: number) => {
//     setExpandedCoding(expandedCoding === index ? null : index)
//   }

//   const toggleMCQQuestion = (index: number) => {
//     setExpandedMCQ(expandedMCQ === index ? null : index)
//   }

//   const codingQuestions = [
//     {
//       id: 1,
//       title: 'Implement Binary Search Tree',
//       score: '18/20',
//       feedback: 'Excellent implementation with proper error handling and edge cases. Consider optimizing the balance method for better performance.'
//     },
//     {
//       id: 2,
//       title: 'Dynamic Programming - Longest Common Subsequence',
//       score: '15/20',
//       feedback: 'Good approach with dynamic programming. However, the space complexity could be improved by using a rolling array technique.'
//     },
//     {
//       id: 3,
//       title: 'REST API Design - User Authentication',
//       score: '19/20',
//       feedback: 'Well-structured API design with proper authentication flow. Consider adding rate limiting for production use.'
//     },
//     {
//       id: 4,
//       title: 'Algorithm - Find Kth Largest Element',
//       score: '16/20',
//       feedback: 'Correct implementation using quickselect. The average time complexity is optimal, but consider handling worst-case scenarios.'
//     }
//   ]

//   const mcqQuestions = [
//     { id: 1, title: 'Time Complexity Analysis', isCorrect: true },
//     { id: 2, title: 'Object-Oriented Programming', isCorrect: true },
//     { id: 8, title: 'Binary Trees', isCorrect: false },
//     { id: 12, title: 'Dynamic Programming', isCorrect: false },
//     { id: 15, title: 'Graph Algorithms', isCorrect: true }
//   ]

//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       <div className="max-w-4xl mx-auto">
//         <button
//           onClick={() => setIsOpen(true)}
//           className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
//         >
//           View Assessment Feedback
//         </button>

//         {isOpen && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto py-8">
//             <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 shadow-2xl">
//               {/* Header with gradient */}
//               <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-8 rounded-t-2xl relative">
//                 <button
//                   onClick={() => setIsOpen(false)}
//                   className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>

//                 <div className="flex items-center gap-2 mb-6">
//                   <h2 className="text-2xl font-bold text-white">Assessment Feedback</h2>
//                   <div className="flex items-center gap-1 bg-white bg-opacity-20 px-3 py-1 rounded-full">
//                     <Sparkles className="w-4 h-4 text-white" />
//                     <span className="text-xs text-white font-medium">AI Generated</span>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-8">
//                   <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 text-center">
//                     <div className="text-white text-sm mb-1">Overall Score</div>
//                     <div className="text-4xl font-bold text-white">/ 100</div>
//                   </div>
//                   <div className="text-left">
//                     <div className="text-5xl font-bold text-white mb-1">A-</div>
//                     <div className="text-white text-opacity-90">Grade</div>
//                   </div>
//                 </div>
//               </div>

//               {/* Content */}
//               <div className="p-8 max-h-[600px] overflow-y-auto">
//                 {/* Overall Assessment */}
//                 <div className="mb-8">
//                   <div className="flex items-center gap-2 mb-4">
//                     <Sparkles className="w-5 h-5 text-purple-600" />
//                     <h3 className="text-xl font-semibold text-gray-900">Overall Assessment</h3>
//                   </div>
//                   <div className="bg-gray-50 rounded-xl p-6">
//                     <p className="text-muted-foreground leading-relaxed">
//                       This is a strong performance that demonstrates solid comprehension of both theoretical concepts and practical implementation. Your coding solutions show good problem-solving skills and clean code structure, while your MCQ performance indicates strong grasp of fundamental concepts. Focus on optimizing algorithm efficiency and reviewing advanced data structures to reach the next level.
//                     </p>
//                   </div>
//                 </div>

//                 {/* Coding Questions Section */}
//                 <div className="mb-8">
//                   <div className="flex items-center gap-2 mb-4">
//                     <Code className="w-5 h-5 text-purple-600" />
//                     <h3 className="text-xl font-semibold text-gray-900">Coding Questions</h3>
//                   </div>

//                   <div className="grid grid-cols-2 gap-4 mb-4">
//                     <div className="bg-gray-50 rounded-lg p-4">
//                       <div className="text-sm text-gray-600 mb-1">Attempted</div>
//                       <div className="text-2xl font-bold text-gray-900">4 / 5</div>
//                     </div>
//                     <div className="bg-gray-50 rounded-lg p-4">
//                       <div className="text-sm text-gray-600 mb-1">Average Score</div>
//                       <div className="text-2xl font-bold text-purple-600">82%</div>
//                     </div>
//                   </div>

//                   <div className="mb-4">
//                     <div className="mb-2">
//                       <span className="text-sm font-medium text-green-700">Strong Areas:</span>
//                     </div>
//                     <div className="flex flex-wrap gap-2 mb-3">
//                       <span className="flex items-center gap-1 text-sm text-green-700">
//                         <CheckCircle className="w-4 h-4" />
//                         Clean and readable code structure
//                       </span>
//                       <span className="flex items-center gap-1 text-sm text-green-700">
//                         <CheckCircle className="w-4 h-4" />
//                         Proper error handling implemented
//                       </span>
//                       <span className="flex items-center gap-1 text-sm text-green-700">
//                         <CheckCircle className="w-4 h-4" />
//                         Good use of appropriate data structures
//                       </span>
//                     </div>

//                     <div className="mb-2">
//                       <span className="text-sm font-medium text-orange-700">Focus On:</span>
//                     </div>
//                     <div className="flex flex-wrap gap-2">
//                       <span className="flex items-center gap-1 text-sm text-orange-700">
//                         <AlertCircle className="w-4 h-4" />
//                         Algorithm time complexity optimization
//                       </span>
//                       <span className="flex items-center gap-1 text-sm text-orange-700">
//                         <AlertCircle className="w-4 h-4" />
//                         Edge case handling in recursion
//                       </span>
//                       <span className="flex items-center gap-1 text-sm text-orange-700">
//                         <AlertCircle className="w-4 h-4" />
//                         Code documentation and comments
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Detailed Coding Questions Feedback */}
//                 <div className="mb-8">
//                   <div className="flex items-center gap-2 mb-4">
//                     <Code className="w-5 h-5 text-purple-600" />
//                     <h3 className="text-xl font-semibold text-gray-900">Detailed Coding Questions Feedback</h3>
//                   </div>

//                   <div className="space-y-3">
//                     {codingQuestions.map((question, index) => (
//                       <div key={question.id} className="border border-gray-200 rounded-lg overflow-hidden">
//                         <button
//                           onClick={() => toggleCodingQuestion(index)}
//                           className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
//                         >
//                           <div className="flex items-center gap-3">
//                             <span className="text-sm font-medium text-gray-500">Q{question.id}</span>
//                             <span className="text-sm font-medium text-gray-900">{question.title}</span>
//                           </div>
//                           <div className="flex items-center gap-3">
//                             <span className="text-sm font-bold text-purple-600">{question.score}</span>
//                             {expandedCoding === index ? (
//                               <ChevronUp className="w-5 h-5 text-gray-400" />
//                             ) : (
//                               <ChevronDown className="w-5 h-5 text-gray-400" />
//                             )}
//                           </div>
//                         </button>

//                         {expandedCoding === index && (
//                           <div className="px-4 pb-4 bg-gray-50">
//                             <p className="text-sm text-muted-foreground">{question.feedback}</p>
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Multiple Choice Section */}
//                 <div className="mb-8">
//                   <div className="flex items-center gap-2 mb-4">
//                     <div className="w-5 h-5 text-purple-600">☰</div>
//                     <h3 className="text-xl font-semibold text-gray-900">Multiple Choice</h3>
//                   </div>

//                   <div className="grid grid-cols-2 gap-4 mb-4">
//                     <div className="bg-gray-50 rounded-lg p-4">
//                       <div className="text-sm text-gray-600 mb-1">Correct Answers</div>
//                       <div className="text-2xl font-bold text-gray-900">23 / 25</div>
//                     </div>
//                     <div className="bg-gray-50 rounded-lg p-4">
//                       <div className="text-sm text-gray-600 mb-1">Accuracy</div>
//                       <div className="text-2xl font-bold text-purple-600">92%</div>
//                     </div>
//                   </div>

//                   <div className="mb-4">
//                     <div className="mb-2">
//                       <span className="text-sm font-medium text-green-700">Strong Topics:</span>
//                     </div>
//                     <div className="flex flex-wrap gap-2 mb-3">
//                       <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Arrays</span>
//                       <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">OOP Concepts</span>
//                       <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Algorithms</span>
//                     </div>

//                     <div className="mb-2">
//                       <span className="text-sm font-medium text-orange-700">Review Topics:</span>
//                     </div>
//                     <div className="flex flex-wrap gap-2">
//                       <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">Trees</span>
//                       <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">Dynamic Programming</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Detailed MCQ Feedback */}
//                 <div className="mb-8">
//                   <div className="flex items-center gap-2 mb-4">
//                     <div className="w-5 h-5 text-purple-600">☰</div>
//                     <h3 className="text-xl font-semibold text-gray-900">Detailed MCQ Feedback</h3>
//                   </div>

//                   <div className="space-y-3">
//                     {mcqQuestions.map((question, index) => (
//                       <button
//                         key={question.id}
//                         onClick={() => toggleMCQQuestion(index)}
//                         className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
//                       >
//                         <div className="flex items-center gap-3">
//                           <span className="text-sm font-medium text-gray-500">Q{question.id}</span>
//                           <span className="text-sm font-medium text-gray-900">{question.title}</span>
//                         </div>
//                         <div className="flex items-center gap-3">
//                           <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                             question.isCorrect
//                               ? 'bg-green-100 text-green-700'
//                               : 'bg-red-100 text-red-700'
//                           }`}>
//                             {question.isCorrect ? 'Correct' : 'Incorrect'}
//                           </span>
//                           <ChevronDown className="w-5 h-5 text-gray-400" />
//                         </div>
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Key Takeaways */}
//                 <div className="mb-6">
//                   <div className="flex items-center gap-2 mb-4">
//                     <Lightbulb className="w-5 h-5 text-purple-600" />
//                     <h3 className="text-xl font-semibold text-gray-900">Key Takeaways</h3>
//                   </div>

//                   <div className="bg-purple-50 rounded-xl p-6 space-y-3">
//                     <div className="flex items-start gap-3">
//                       <div className="w-2 h-2 rounded-full bg-purple-600 mt-2"></div>
//                       <p className="text-muted-foreground">Your coding fundamentals are solid - keep practicing complex problems</p>
//                     </div>
//                     <div className="flex items-start gap-3">
//                       <div className="w-2 h-2 rounded-full bg-purple-600 mt-2"></div>
//                       <p className="text-muted-foreground">Review tree-based data structures and their applications</p>
//                     </div>
//                     <div className="flex items-start gap-3">
//                       <div className="w-2 h-2 rounded-full bg-purple-600 mt-2"></div>
//                       <p className="text-muted-foreground">Focus on time/space complexity analysis in your solutions</p>
//                     </div>
//                     <div className="flex items-start gap-3">
//                       <div className="w-2 h-2 rounded-full bg-purple-600 mt-2"></div>
//                       <p className="text-muted-foreground">Great job on object-oriented design patterns</p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Footer Buttons */}
//                 <div className="flex gap-4 pt-4 border-t border-gray-200">
//                   <button
//                     onClick={() => setIsOpen(false)}
//                     className="flex-1 px-6 py-3 border border-gray-300 text-muted-foreground rounded-lg hover:bg-gray-50 transition-colors font-medium"
//                   >
//                     Close
//                   </button>
//                   <button className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
//                     View Details
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default AssessmentFeedbackModal

// import React, { useState } from 'react'
// import { X, ChevronDown, ChevronUp, Sparkles, Code, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react'

// type modalProps = {
//     setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
//     isOpen: boolean
// }

// const AssessmentFeedbackModal = ({setIsOpen, isOpen}: modalProps) => {
//   const [expandedCoding, setExpandedCoding] = useState<number | null>(null)
//   const [expandedMCQ, setExpandedMCQ] = useState<number | null>(null)

//   const toggleCodingQuestion = (index: number) => {
//     setExpandedCoding(expandedCoding === index ? null : index)
//   }

//   const toggleMCQQuestion = (index: number) => {
//     setExpandedMCQ(expandedMCQ === index ? null : index)
//   }

//   const codingQuestions = [
//     {
//       id: 1,
//       title: 'Implement Binary Search Tree',
//       score: '18/20',
//       feedback: 'Excellent implementation with proper error handling and edge cases. Consider optimizing the balance method for better performance.'
//     },
//     {
//       id: 2,
//       title: 'Dynamic Programming - Longest Common Subsequence',
//       score: '15/20',
//       feedback: 'Good approach with dynamic programming. However, the space complexity could be improved by using a rolling array technique.'
//     },
//     {
//       id: 3,
//       title: 'REST API Design - User Authentication',
//       score: '19/20',
//       feedback: 'Well-structured API design with proper authentication flow. Consider adding rate limiting for production use.'
//     },
//     {
//       id: 4,
//       title: 'Algorithm - Find Kth Largest Element',
//       score: '16/20',
//       feedback: 'Correct implementation using quickselect. The average time complexity is optimal, but consider handling worst-case scenarios.'
//     }
//   ]

//   const mcqQuestions = [
//     { id: 1, title: 'Time Complexity Analysis', isCorrect: true },
//     { id: 2, title: 'Object-Oriented Programming', isCorrect: true },
//     { id: 8, title: 'Binary Trees', isCorrect: false },
//     { id: 12, title: 'Dynamic Programming', isCorrect: false },
//     { id: 15, title: 'Graph Algorithms', isCorrect: true }
//   ]

//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       <div className="max-w-4xl mx-auto">
//         {/* <button
//           onClick={() => setIsOpen(true)}
//           className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
//         >
//           View Assessment Feedback
//         </button> */}

//         {isOpen && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto py-8">
//             <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 shadow-2xl">
//               {/* Header with gradient */}
//               <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-8 rounded-t-2xl relative">
//                 <button
//                   onClick={() => setIsOpen(false)}
//                   className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>

//                 <div className="flex items-center gap-2 mb-6">
//                   <h2 className="text-2xl font-bold text-white">Assessment Feedback</h2>
//                   <div className="flex items-center gap-1 bg-white bg-opacity-20 px-3 py-1 rounded-full">
//                     <Sparkles className="w-4 h-4 text-white" />
//                     <span className="text-xs text-white font-medium">AI Generated</span>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-8">
//                   <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 text-center">
//                     <div className="text-white text-sm mb-1">Overall Score</div>
//                     <div className="text-4xl font-bold text-white">/ 100</div>
//                   </div>
//                   <div className="text-left">
//                     <div className="text-5xl font-bold text-white mb-1">A-</div>
//                     <div className="text-white text-opacity-90">Grade</div>
//                   </div>
//                 </div>
//               </div>

//               {/* Content */}
//               <div className="p-8 max-h-[600px] overflow-y-auto">
//                 {/* Overall Assessment */}
//                 <div className="mb-8">
//                   <div className="flex items-center gap-2 mb-4">
//                     <Sparkles className="w-5 h-5 text-purple-600" />
//                     <h3 className="text-xl font-semibold text-gray-900">Overall Assessment</h3>
//                   </div>
//                   <div className="bg-gray-50 rounded-xl p-6">
//                     <p className="text-muted-foreground leading-relaxed">
//                       This is a strong performance that demonstrates solid comprehension of both theoretical concepts and practical implementation. Your coding solutions show good problem-solving skills and clean code structure, while your MCQ performance indicates strong grasp of fundamental concepts. Focus on optimizing algorithm efficiency and reviewing advanced data structures to reach the next level.
//                     </p>
//                   </div>
//                 </div>

//                 {/* Coding Questions and Multiple Choice Cards - Side by Side */}
//                 <div className="grid grid-cols-2 gap-4 mb-8">
//                   {/* Coding Questions Card */}
//                   <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
//                     <div className="flex items-center gap-2 mb-4">
//                       <Code className="w-5 h-5 text-muted-foreground" />
//                       <h3 className="text-lg font-semibold text-gray-900">Coding Questions</h3>
//                     </div>

//                     <div className="space-y-3 mb-4">
//                       <div className="flex justify-between items-center">
//                         <span className="text-sm text-gray-600">Attempted</span>
//                         <span className="text-base font-semibold text-gray-900">4 / 5</span>
//                       </div>
//                       <div className="flex justify-between items-center">
//                         <span className="text-sm text-gray-600">Average Score</span>
//                         <span className="text-base font-semibold text-purple-600">82%</span>
//                       </div>
//                       <div className="w-full bg-gray-200 rounded-full h-2">
//                         <div className="bg-purple-600 h-2 rounded-full" style={{width: '82%'}}></div>
//                       </div>
//                     </div>

//                     <div className="mb-4">
//                       <div className="mb-2">
//                         <span className="text-sm font-semibold text-green-600">Strong Areas:</span>
//                       </div>
//                       <div className="space-y-1.5">
//                         <div className="flex items-start gap-2">
//                           <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
//                           <span className="text-sm text-muted-foreground">Clean and readable code structure</span>
//                         </div>
//                         <div className="flex items-start gap-2">
//                           <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
//                           <span className="text-sm text-muted-foreground">Proper error handling implemented</span>
//                         </div>
//                         <div className="flex items-start gap-2">
//                           <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
//                           <span className="text-sm text-muted-foreground">Good use of appropriate data structures</span>
//                         </div>
//                       </div>
//                     </div>

//                     <div>
//                       <div className="mb-2">
//                         <span className="text-sm font-semibold text-purple-600">Focus On:</span>
//                       </div>
//                       <div className="space-y-1.5">
//                         <div className="flex items-start gap-2">
//                           <div className="w-4 h-4 mt-0.5 flex-shrink-0">
//                             <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
//                             </svg>
//                           </div>
//                           <span className="text-sm text-muted-foreground">Algorithm time complexity optimization</span>
//                         </div>
//                         <div className="flex items-start gap-2">
//                           <div className="w-4 h-4 mt-0.5 flex-shrink-0">
//                             <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
//                             </svg>
//                           </div>
//                           <span className="text-sm text-muted-foreground">Edge case handling in recursion</span>
//                         </div>
//                         <div className="flex items-start gap-2">
//                           <div className="w-4 h-4 mt-0.5 flex-shrink-0">
//                             <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
//                             </svg>
//                           </div>
//                           <span className="text-sm text-muted-foreground">Code documentation and comments</span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Multiple Choice Card */}
//                   <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
//                     <div className="flex items-center gap-2 mb-4">
//                       <div className="w-5 h-5 text-muted-foreground">
//                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                         </svg>
//                       </div>
//                       <h3 className="text-lg font-semibold text-gray-900">Multiple Choice</h3>
//                     </div>

//                     <div className="space-y-3 mb-4">
//                       <div className="flex justify-between items-center">
//                         <span className="text-sm text-gray-600">Correct Answers</span>
//                         <span className="text-base font-semibold text-gray-900">23 / 25</span>
//                       </div>
//                       <div className="flex justify-between items-center">
//                         <span className="text-sm text-gray-600">Accuracy</span>
//                         <span className="text-base font-semibold text-purple-600">92%</span>
//                       </div>
//                       <div className="w-full bg-gray-200 rounded-full h-2">
//                         <div className="bg-purple-600 h-2 rounded-full" style={{width: '92%'}}></div>
//                       </div>
//                     </div>

//                     <div className="mb-4">
//                       <div className="mb-2">
//                         <span className="text-sm font-semibold text-green-600">Strong Topics:</span>
//                       </div>
//                       <div className="flex flex-wrap gap-2">
//                         <span className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm font-medium">Arrays</span>
//                         <span className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm font-medium">OOP Concepts</span>
//                         <span className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm font-medium">Algorithms</span>
//                       </div>
//                     </div>

//                     <div>
//                       <div className="mb-2">
//                         <span className="text-sm font-semibold text-orange-600">Review Topics:</span>
//                       </div>
//                       <div className="flex flex-wrap gap-2">
//                         <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-md text-sm font-medium">Trees</span>
//                         <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-md text-sm font-medium">Dynamic Programming</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Detailed Coding Questions Feedback */}
//                 <div className="mb-8">
//                   <div className="flex items-center gap-2 mb-4">
//                     <Code className="w-5 h-5 text-purple-600" />
//                     <h3 className="text-xl font-semibold text-gray-900">Detailed Coding Questions Feedback</h3>
//                   </div>

//                   <div className="space-y-3">
//                     {codingQuestions.map((question, index) => (
//                       <div key={question.id} className="border border-gray-200 rounded-lg overflow-hidden">
//                         <button
//                           onClick={() => toggleCodingQuestion(index)}
//                           className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
//                         >
//                           <div className="flex items-center gap-3">
//                             <span className="text-sm font-medium text-gray-500">Q{question.id}</span>
//                             <span className="text-sm font-medium text-gray-900">{question.title}</span>
//                           </div>
//                           <div className="flex items-center gap-3">
//                             <span className="text-sm font-bold text-purple-600">{question.score}</span>
//                             {expandedCoding === index ? (
//                               <ChevronUp className="w-5 h-5 text-gray-400" />
//                             ) : (
//                               <ChevronDown className="w-5 h-5 text-gray-400" />
//                             )}
//                           </div>
//                         </button>

//                         {expandedCoding === index && (
//                           <div className="px-4 pb-4 bg-gray-50">
//                             <p className="text-sm text-muted-foreground">{question.feedback}</p>
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Multiple Choice Section */}
//                 <div className="mb-8">
//                   <div className="flex items-center gap-2 mb-4">
//                     <div className="w-5 h-5 text-purple-600">☰</div>
//                     <h3 className="text-xl font-semibold text-gray-900">Multiple Choice</h3>
//                   </div>

//                   <div className="grid grid-cols-2 gap-4 mb-4">
//                     <div className="bg-gray-50 rounded-lg p-4">
//                       <div className="text-sm text-gray-600 mb-1">Correct Answers</div>
//                       <div className="text-2xl font-bold text-gray-900">23 / 25</div>
//                     </div>
//                     <div className="bg-gray-50 rounded-lg p-4">
//                       <div className="text-sm text-gray-600 mb-1">Accuracy</div>
//                       <div className="text-2xl font-bold text-purple-600">92%</div>
//                     </div>
//                   </div>

//                   <div className="bg-white border border-gray-200 rounded-lg p-5 mb-4">
//                     <div className="mb-3">
//                       <span className="text-sm font-semibold text-green-600">Strong Topics:</span>
//                     </div>
//                     <div className="flex flex-wrap gap-2 mb-4">
//                       <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-md text-sm font-medium">Arrays</span>
//                       <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-md text-sm font-medium">OOP Concepts</span>
//                       <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-md text-sm font-medium">Algorithms</span>
//                     </div>

//                     <div className="mb-3">
//                       <span className="text-sm font-semibold text-orange-600">Review Topics:</span>
//                     </div>
//                     <div className="flex flex-wrap gap-2">
//                       <span className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-md text-sm font-medium">Trees</span>
//                       <span className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-md text-sm font-medium">Dynamic Programming</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Detailed MCQ Feedback */}
//                 <div className="mb-8">
//                   <div className="flex items-center gap-2 mb-4">
//                     <div className="w-5 h-5 text-purple-600">☰</div>
//                     <h3 className="text-xl font-semibold text-gray-900">Detailed MCQ Feedback</h3>
//                   </div>

//                   <div className="space-y-3">
//                     {mcqQuestions.map((question, index) => (
//                       <button
//                         key={question.id}
//                         onClick={() => toggleMCQQuestion(index)}
//                         className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
//                       >
//                         <div className="flex items-center gap-3">
//                           <span className="text-sm font-medium text-gray-500">Q{question.id}</span>
//                           <span className="text-sm font-medium text-gray-900">{question.title}</span>
//                         </div>
//                         <div className="flex items-center gap-3">
//                           <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                             question.isCorrect
//                               ? 'bg-green-100 text-green-700'
//                               : 'bg-red-100 text-red-700'
//                           }`}>
//                             {question.isCorrect ? 'Correct' : 'Incorrect'}
//                           </span>
//                           <ChevronDown className="w-5 h-5 text-gray-400" />
//                         </div>
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Key Takeaways */}
//                 <div className="mb-6">
//                   <div className="flex items-center gap-2 mb-4">
//                     <Lightbulb className="w-5 h-5 text-purple-600" />
//                     <h3 className="text-xl font-semibold text-gray-900">Key Takeaways</h3>
//                   </div>

//                   <div className="bg-purple-50 rounded-xl p-6 space-y-3">
//                     <div className="flex items-start gap-3">
//                       <div className="w-2 h-2 rounded-full bg-purple-600 mt-2"></div>
//                       <p className="text-muted-foreground">Your coding fundamentals are solid - keep practicing complex problems</p>
//                     </div>
//                     <div className="flex items-start gap-3">
//                       <div className="w-2 h-2 rounded-full bg-purple-600 mt-2"></div>
//                       <p className="text-muted-foreground">Review tree-based data structures and their applications</p>
//                     </div>
//                     <div className="flex items-start gap-3">
//                       <div className="w-2 h-2 rounded-full bg-purple-600 mt-2"></div>
//                       <p className="text-muted-foreground">Focus on time/space complexity analysis in your solutions</p>
//                     </div>
//                     <div className="flex items-start gap-3">
//                       <div className="w-2 h-2 rounded-full bg-purple-600 mt-2"></div>
//                       <p className="text-muted-foreground">Great job on object-oriented design patterns</p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Footer Buttons */}
//                 <div className="flex gap-4 pt-4 border-t border-gray-200">
//                   <button
//                     onClick={() => setIsOpen(false)}
//                     className="flex-1 px-6 py-3 border border-gray-300 text-muted-foreground rounded-lg hover:bg-gray-50 transition-colors font-medium"
//                   >
//                     Close
//                   </button>
//                   <button className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
//                     View Details
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default AssessmentFeedbackModal

import React, { useState } from 'react'
import {
    X,
    ChevronDown,
    ChevronUp,
    Sparkles,
    Code,
    CheckCircle,
    AlertCircle,
    Lightbulb,
    Percent,
} from 'lucide-react'
// import { OctagonAlert } from 'lucide-react';
import { ShieldAlert } from 'lucide-react'
// import { TriangleAlert } from 'lucide-react';
import {
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { suggest } from '@remirror/pm/suggest'

type modalProps = {
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
    isOpen: boolean
}

// const AssessmentFeedbackModal = ({setIsOpen, isOpen}: modalProps) => {
const AssessmentFeedbackModal = () => {
    const [expandedCoding, setExpandedCoding] = useState<number | null>(null)
    const [expandedMCQ, setExpandedMCQ] = useState<number | null>(null)

    const toggleCodingQuestion = (index: number) => {
        setExpandedCoding(expandedCoding === index ? null : index)
    }

    const toggleMCQQuestion = (index: number) => {
        setExpandedMCQ(expandedMCQ === index ? null : index)
    }

    const codingQuestions = [
        {
            id: 1,
            title: 'Implement Binary Search Tree',
            score: '18/20',
            percent: 90,
            feedback: {
                explanation:
                    'Excellent implementation with proper error handling and edge cases. Consider optimizing the balance method for better performance.',
                strength: [
                    'Correct BST insertion logic',
                    'In-order traversal implemented',
                    'Proper error handling',
                    'Good variable naming conventions',
                ],
                weakness: [
                    'Balance method could be optimized',
                    'Consider edge cases for duplicate values',
                ],
            },
        },
        {
            id: 2,
            title: 'Dynamic Programming - Longest Common Subsequence',
            score: '15/20',
            percent: 75,
            feedback: {
                suggestion:
                    'Consider implementing self-balancing features like AVL rotations to maintain O(log n) time complexity. Also, explore iterative approaches for tree traversal to reduce stack space usage.',
                strength: [
                    'Correct use of dynamic programming principles',
                    'Well-structured code',
                ],
                weakness: [
                    'Space complexity could be optimized',
                    'Lack of edge case handling',
                ],
            },
        },
        {
            id: 3,
            title: 'REST API Design - User Authentication',
            score: '19/20',
            percent: 95,
            feedback: {
                suggestion:
                    'Try implementing the space-optimized version using only two rows instead of the full matrix. This reduces space complexity from O(m*n) to O(n). Also, add comments explaining the recurrence relation.',
                strength: [
                    'Clear endpoint structure',
                    'Proper use of HTTP methods',
                    'Comprehensive authentication flow',
                ],
                weakness: [
                    'Lack of rate limiting',
                    'No versioning for API endpoints',
                ],
            },
        },
        {
            id: 4,
            title: 'Algorithm - Find Kth Largest Element',
            score: '16/20',
            percent: 80,
            feedback: {
                suggestion:
                    'Correct implementation using quickselect. The average time complexity is optimal, but consider handling worst-case scenarios.',
                strength: [
                    'Efficient average time complexity',
                    'Good use of partitioning logic',
                ],
                weakness: [
                    'Does not handle worst-case scenarios',
                    'Could improve code readability',
                ],
            },
        },
    ]

    // const codingQuestions = [
    // {
    //         id: 4,
    //         title: 'Algorithm - Find Kth Largest Element',
    //         score: '16/20',
    //         feedback:
    //             'Correct implementation using quickselect. The average time complexity is optimal, but consider handling worst-case scenarios.',
    //     }
    // ]

    // const mcqQuestions = [
    //     { id: 1, title: 'Time Complexity Analysis', isCorrect: true },
    //     { id: 2, title: 'Object-Oriented Programming', isCorrect: true },
    //     { id: 8, title: 'Binary Trees', isCorrect: false },
    //     { id: 12, title: 'Dynamic Programming', isCorrect: false },
    //     { id: 15, title: 'Graph Algorithms', isCorrect: true },
    // ]

    const mcqQuestions = [
        {
            id: 1,
            title: 'Time Complexity Analysis',
            isCorrect: true,
            yourAnswer: 'O(n log n)',
            correctAnswer: 'O(n log n)',
            explanation:
                'Merge sort has a time complexity of O(n log n) in all cases (best, average, and worst). The algorithm divides the array into two halves recursively (log n levels) and merges them (n comparisons per level).',
        },
        {
            id: 2,
            title: 'Object-Oriented Programming',
            isCorrect: true,
            yourAnswer: 'Encapsulation',
            correctAnswer: 'Encapsulation',
            explanation:
                'Encapsulation is the bundling of data and methods that operate on that data within a single unit, restricting direct access to some components.',
        },
        {
            id: 8,
            title: 'Binary Trees',
            isCorrect: false,
            yourAnswer: 'O(n)',
            correctAnswer: 'O(log n)',
            explanation:
                'In a balanced binary search tree, searching for an element takes O(log n) time because at each step, we eliminate half of the remaining nodes. O(n) would be the worst case for a completely skewed tree.',
        },
        {
            id: 12,
            title: 'Dynamic Programming',
            isCorrect: false,
            yourAnswer: 'Greedy approach',
            correctAnswer: 'Memoization',
            explanation:
                "Dynamic programming uses memoization to store previously computed results, avoiding redundant calculations. Greedy approach makes locally optimal choices but doesn't guarantee global optimum.",
        },
        {
            id: 15,
            title: 'Graph Algorithms',
            isCorrect: true,
            yourAnswer: "Dijkstra's Algorithm",
            correctAnswer: "Dijkstra's Algorithm",
            explanation:
                "Dijkstra's algorithm is used to find the shortest path from a source node to all other nodes in a weighted graph with non-negative edge weights.",
        },
    ]

    return (
        <DialogContent className="max-w-4xl text-foreground">
            {/* <DialogHeader className="text-left">
                <DialogTitle className="text-left">
                    Create New Course
                </DialogTitle>
            </DialogHeader> */}

            <ScrollArea className="max-h-[60vh] px-1">
                {/* <div> */}
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-8 rounded-t-2xl relative">
                    <button
                        // onClick={() => setIsOpen(false)}
                        className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2 mb-6">
                        <h2 className="text-2xl font-bold text-white">
                            Assessment Feedback
                        </h2>
                        <div className="flex items-center gap-1 bg-white bg-opacity-20 px-3 py-1 rounded-full">
                            <Sparkles className="w-4 h-4 text-white" />
                            <span className="text-xs text-white font-medium">
                                AI Generated
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 text-center">
                            <div className="text-white text-sm mb-1">
                                Overall Score
                            </div>
                            <div className="text-4xl font-bold text-white">
                                / 100
                            </div>
                        </div>
                        <div className="text-left">
                            <div className="text-5xl font-bold text-white mb-1">
                                A-
                            </div>
                            <div className="text-white text-opacity-90">
                                Grade
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="py-8 px-2 text-left">
                    {/* Overall Assessment */}
                    <div className="mb-8 border bg-card rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            <h3 className="text-xl font-semibold text-gray-900">
                                Overall Assessment
                            </h3>
                        </div>
                        <p className="text-muted-foreground text-md">
                            This is a strong performance that demonstrates solid
                            comprehension of both theoretical concepts and
                            practical implementation. Your coding solutions show
                            good problem-solving skills and clean code
                            structure, while your MCQ performance indicates
                            strong grasp of fundamental concepts. Focus on
                            optimizing algorithm efficiency and reviewing
                            advanced data structures to reach the next level.
                        </p>
                    </div>
                    {/* Coding Questions and Multiple Choice Cards - Side by Side */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {/* Coding Questions Card */}
                        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Code className="w-5 h-5 text-muted-foreground" />
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Coding Questions
                                </h3>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-md text-gray-600">
                                        Attempted
                                    </span>
                                    <span className="text-md font-semibold text-gray-900">
                                        4 / 5
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-md text-gray-600">
                                        Average Score
                                    </span>
                                    <span className="text-md font-semibold text-purple-600">
                                        82%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-purple-600 h-2 rounded-full text-md"
                                        style={{ width: '82%' }}
                                    ></div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="mb-2">
                                    <span className="text-base font-semibold text-green-600">
                                        Strong Areas:
                                    </span>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-base text-muted-foreground">
                                            Clean and readable code structure
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-base text-muted-foreground">
                                            Proper error handling implemented
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-base text-muted-foreground">
                                            Good use of appropriate data
                                            structures
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="mb-2">
                                    <span className="text-base font-semibold text-purple-600">
                                        Focus On:
                                    </span>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-start gap-2">
                                        <div className="w-4 h-4 mt-0.5 flex-shrink-0">
                                            <svg
                                                className="w-4 h-4 text-purple-600"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                                />
                                            </svg>
                                        </div>
                                        <span className="text-base text-muted-foreground">
                                            Algorithm time complexity
                                            optimization
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-4 h-4 mt-0.5 flex-shrink-0">
                                            <svg
                                                className="w-4 h-4 text-purple-600"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                                />
                                            </svg>
                                        </div>
                                        <span className="text-base text-muted-foreground">
                                            Edge case handling in recursion
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-4 h-4 mt-0.5 flex-shrink-0">
                                            <svg
                                                className="w-4 h-4 text-purple-600"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                                />
                                            </svg>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            Code documentation and comments
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Multiple Choice Card */}
                        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-5 h-5 text-muted-foreground">
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Multiple Choice
                                </h3>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-md text-gray-600">
                                        Correct Answers
                                    </span>
                                    <span className="text-md font-semibold text-gray-900">
                                        23 / 25
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-md text-gray-600">
                                        Accuracy
                                    </span>
                                    <span className="text-md font-semibold text-purple-600">
                                        52%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-purple-600 h-2 rounded-full text-md"
                                        style={{ width: '52%' }}
                                    ></div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="mb-2">
                                    <span className="text-base font-semibold text-green-600">
                                        Strong Topics:
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm font-medium">
                                        Arrays
                                    </span>
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm font-medium">
                                        OOP Concepts
                                    </span>
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm font-medium">
                                        Algorithms
                                    </span>
                                </div>
                            </div>

                            <div>
                                <div className="mb-2">
                                    <span className="text-base font-semibold text-orange-600">
                                        Review Topics:
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-md text-sm font-medium">
                                        Trees
                                    </span>
                                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-md text-sm font-medium">
                                        Dynamic Programming
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Coding Questions Feedback */}
                    <div className="mb-7">
                        <div className="flex items-center gap-2 mb-4">
                            <Code className="w-5 h-5 text-purple-600" />
                            <h3 className="text-xl font-semibold text-gray-900 mt-1">
                                Detailed Coding Questions Feedback
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {codingQuestions.map((question, index) => (
                                <div
                                    key={question.id}
                                    className="border border-gray-200 rounded-lg overflow-hidden"
                                >
                                    <button
                                        onClick={() =>
                                            toggleCodingQuestion(index)
                                        }
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-base font-medium text-gray-500">
                                                Q{question.id}
                                            </span>
                                            <span className="text-base font-medium text-gray-900">
                                                {question.title}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-base font-bold text-purple-600">
                                                {question.score}
                                            </span>
                                            {expandedCoding === index ? (
                                                <ChevronUp className="w-5 h-5 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                    </button>

                                    {expandedCoding === index && (
                                        <div className="p-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-md text-gray-600 mb-1">
                                                    Score
                                                </span>
                                                <span className="text-md font-semibold">
                                                    82%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-primary h-2 rounded-full text-md"
                                                    style={{ width: '82%' }}
                                                ></div>
                                            </div>
                                            <div className="mt-4">
                                                <div className="flex items-start gap-2 mt-4">
                                                    <CheckCircle className="w-5 h-5 text-success pt-1" />
                                                    <span className="text-base text-success">
                                                        Strengths
                                                    </span>
                                                </div>
                                                <div className="mx-2">
                                                    {question.feedback.strength.map(
                                                        (point, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex items-start gap-2 mt-2"
                                                            >
                                                                <div className="bg-muted-foreground h-[0.4rem] w-[0.4rem] rounded-full text-md mt-2"></div>
                                                                <span className="text-base text-muted-foreground">
                                                                    {point}
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <div className="flex items-start gap-2 mt-4">
                                                    <ShieldAlert className="w-5 h-5 text-warning mt-[0.1rem]" />
                                                    <span className="text-base text-warning">
                                                        Areas to Improve
                                                    </span>
                                                </div>
                                                <div className="mx-2">
                                                    {question.feedback.weakness.map(
                                                        (point, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex items-start gap-2 mt-2"
                                                            >
                                                                <div className="bg-muted-foreground h-[0.4rem] w-[0.4rem] rounded-full text-md mt-2"></div>
                                                                <span className="text-base text-muted-foreground">
                                                                    {point}
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                            <div className="border bg-purple-50 rounded-xl p-4 mt-6">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Sparkles className="w-5 h-5 text-purple-500" />
                                                    <h3 className="text-lg font-semibold text-purple-500">
                                                        AI Suggestion
                                                    </h3>
                                                </div>
                                                <p className="text-muted-foreground text-md">
                                                    Consider implementing self-balancing features like AVL rotations to maintain
                                                    O(log n) time complexity. Also, explore iterative approaches for tree
                                                    traversal to reduce stack space usage.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detailed MCQ Feedback */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-5 h-5 text-purple-600">☰</div>
                            <h3 className="text-xl font-semibold text-gray-900 mt-3">
                                Detailed MCQ Feedback
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {mcqQuestions.map((question, index) => (
                                <div
                                    key={question.id}
                                    className="border border-gray-200 rounded-lg overflow-hidden"
                                >
                                    <button
                                        key={question.id}
                                        onClick={() => toggleMCQQuestion(index)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-base font-medium text-gray-500">
                                                Q{question.id}
                                            </span>
                                            <span className="text-base font-medium text-gray-900">
                                                {question.title}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    question.isCorrect
                                                        ? 'bg-success-light text-green-700'
                                                        : 'bg-destructive-light text-red-700'
                                                }`}
                                            >
                                                {question.isCorrect
                                                    ? 'Correct'
                                                    : 'Incorrect'}
                                            </span>
                                            {expandedMCQ === index ? (
                                                <ChevronUp className="w-5 h-5 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                    </button>
                                    {expandedMCQ === index && (
                                        <div className="p-4">
                                            <div className='flex gap-4'>
                                                {
                                                    question.isCorrect ? (
                                                        <div className="bg-success-light px-4 py-2 rounded-lg w-full border border-success">
                                                            <p className='text-muted-foreground font-medium'>Your Answer:</p>
                                                            <p className='text-success font-medium'>{question.yourAnswer}</p>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-destructive-light px-4 pt-2 rounded-lg w-full border border-destructive">
                                                            <p className='text-muted-foreground font-medium'>Your Answer:</p>
                                                            <p className='text-destructive font-medium'>{question.yourAnswer}</p>
                                                        </div>
                                                    )}
                                                <div className="bg-success-light px-4 pt-2 rounded-lg w-full border border-success">
                                                    <p className='text-muted-foreground font-medium'>Correct Answer:</p>
                                                    <p className='text-success font-medium'>{question.correctAnswer}</p>
                                                </div>
                                            </div>
                                             <div className="border bg-purple-50 rounded-xl p-4 mt-6">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Sparkles className="w-5 h-5 text-purple-500" />
                                                    <h3 className="text-lg font-semibold text-purple-500">
                                                        AI Suggestion
                                                    </h3>
                                                </div>
                                                <p className="text-muted-foreground text-md">
                                                    Consider implementing self-balancing features like AVL rotations to maintain
                                                    O(log n) time complexity. Also, explore iterative approaches for tree
                                                    traversal to reduce stack space usage.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Key Takeaways */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Lightbulb className="w-5 h-5 text-purple-600" />
                            <h3 className="text-xl font-semibold text-gray-900">
                                Key Takeaways
                            </h3>
                        </div>

                        <div className="bg-purple-50 rounded-xl p-6 space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-purple-600 mt-2"></div>
                                <p className="text-muted-foreground">
                                    Your coding fundamentals are solid - keep
                                    practicing complex problems
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-purple-600 mt-2"></div>
                                <p className="text-muted-foreground">
                                    Review tree-based data structures and their
                                    applications
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-purple-600 mt-2"></div>
                                <p className="text-muted-foreground">
                                    Focus on time/space complexity analysis in
                                    your solutions
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-purple-600 mt-2"></div>
                                <p className="text-muted-foreground">
                                    Great job on object-oriented design patterns
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* </div> */}
            </ScrollArea>
            <DialogFooter className="sm:justify-end">
                <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

export default AssessmentFeedbackModal
