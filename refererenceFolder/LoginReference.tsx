
// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// const Login = () => {
//   const navigate = useNavigate();

//   const handleGoogleLogin = () => {
//     // Navigate to dashboard for demo purposes
//     navigate('/dashboard');
//   };

//   // Sample data for the social proof section
//   const socialProofData = [
//     { type: 'student', name: 'Priya Sharma', role: 'SDE Intern at Google', avatar: 'PS' },
//     { type: 'metric', number: '2000+', description: 'Learners across 18 states' },
//     { type: 'student', name: 'Rahul Kumar', role: 'Frontend Dev at Flipkart', avatar: 'RK' },
//     { type: 'metric', number: '400+', description: 'Internships secured' },
//     { type: 'student', name: 'Anita Singh', role: 'Backend Dev at Zomato', avatar: 'AS' },
//     { type: 'metric', number: 'Over 70%', description: 'Learners are women' },
//     { type: 'student', name: 'Vikram Patel', role: 'Full Stack at Swiggy', avatar: 'VP' },
//     { type: 'metric', number: '10 Months', description: 'Bootcamp duration' },
//   ];

//   const firstRowCards = socialProofData.slice(0, 5);
//   const secondRowCards = socialProofData.slice(5, 8);

//   const StudentCard = ({ name, role, avatar }: { name: string; role: string; avatar: string }) => (
//     <div className="bg-secondary-light p-3 rounded-lg flex items-center gap-3 min-w-fit">
//       <Avatar className="h-12 w-12">
//         <AvatarImage src="" />
//         <AvatarFallback className="text-secondary-dark bg-secondary text-sm font-medium">
//           {avatar}
//         </AvatarFallback>
//       </Avatar>
//       <div className="text-left">
//         <div className="text-secondary-dark font-bold text-sm">{name}</div>
//         <div className="text-secondary-dark text-sm">{role}</div>
//       </div>
//     </div>
//   );

//   const MetricCard = ({ number, description }: { number: string; description: string }) => (
//     <div className="bg-accent-light p-3 rounded-lg text-center min-w-fit">
//       <div className="text-accent-dark font-bold text-lg">{number}</div>
//       <div className="text-accent-dark text-sm">{description}</div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
//       {/* Login Panel */}
//       <Card className="w-full max-w-md p-12 md:p-12 p-6 text-center mb-20 md:mb-20">
//         {/* Logo */}
//         <div className="mb-6">
//           <img 
//             src="/lovable-uploads/e9f9f8b0-7112-47b9-8664-85f7a8319bb5.png" 
//             alt="Zuvy Logo" 
//             className="w-16 h-16 mx-auto"
//           />
//         </div>
        
//         {/* Headline */}
//         <h1 className="text-3xl font-bold mb-4 leading-tight">
//           Build Skills of Future<br />in Tech
//         </h1>
        
//         {/* Tagline */}
//         <p className="text-muted-foreground mb-8 leading-relaxed">
//           Master in-demand programming skills and step into a world of opportunities. Start learning today!
//         </p>
        
//         {/* Google Login Button */}
//         <Button 
//           onClick={handleGoogleLogin}
//           className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
//           size="lg"
//         >
//           <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
//             <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
//             <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
//             <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
//             <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
//           </svg>
//           Login with Google
//         </Button>
//       </Card>

//       {/* Social Proof Section */}
//       <div className="w-full max-w-6xl">
//         {/* Desktop Layout */}
//         <div className="hidden md:block">
//           {/* Row 1 - 5 cards */}
//           <div className="flex justify-center gap-2 mb-2">
//             {firstRowCards.map((card, index) => (
//               <div key={index}>
//                 {card.type === 'student' ? (
//                   <StudentCard name={card.name!} role={card.role!} avatar={card.avatar!} />
//                 ) : (
//                   <MetricCard number={card.number!} description={card.description!} />
//                 )}
//               </div>
//             ))}
//           </div>
          
//           {/* Row 2 - 3 cards */}
//           <div className="flex justify-center gap-2">
//             {secondRowCards.map((card, index) => (
//               <div key={index}>
//                 {card.type === 'student' ? (
//                   <StudentCard name={card.name!} role={card.role!} avatar={card.avatar!} />
//                 ) : (
//                   <MetricCard number={card.number!} description={card.description!} />
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Mobile Layout - Horizontal Scroll */}
//         <div className="md:hidden relative">
//           <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
//             {socialProofData.map((card, index) => (
//               <div key={index} className="flex-shrink-0">
//                 {card.type === 'student' ? (
//                   <StudentCard name={card.name!} role={card.role!} avatar={card.avatar!} />
//                 ) : (
//                   <MetricCard number={card.number!} description={card.description!} />
//                 )}
//               </div>
//             ))}
//           </div>
          
//           {/* Right blur effect */}
//           <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
          
//           {/* Left blue hint when scrolled */}
//           <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-primary/20 to-transparent pointer-events-none opacity-0 transition-opacity"></div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;