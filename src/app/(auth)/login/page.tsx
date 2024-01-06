// "use client";
// import { useEffect } from "react";
// import { Box, Container, Typography } from "@mui/material";
// import GoogleIcon from "@mui/icons-material/Google";
// import axios from "axios";
// import { gapi } from "gapi-script";
// import { useRouter } from "next/navigation";
// declare global {
//   interface Window {
//     gapi: any; // 'any' can be replaced with a more specific type if available
//   }
// }
// const LoginPage = () => {
//   const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
//   const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

//   const router = useRouter();
//   const loadGoogleSignInAPI = () => {
//     const script = document.createElement("script");
//     script.src = "https://apis.google.com/js/platform.js";
//     script.onload = () => {
//       window.gapi.load(" ", () => {
//         window.gapi.auth2.init({
//           client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
//         });
//       });
//     };
//     document.body.appendChild(script);
//   };
//   useEffect(() => {
//     loadGoogleSignInAPI();

//     return () => {
//       const script = document.querySelector(
//         "script[src='https://apis.google.com/js/platform.js']"
//       );
//       if (script) {
//         document.body.removeChild(script);
//       }
//     };
//   }, []);
//   const handleLoginSuccess = () => {
//     if (typeof gapi !== "undefined") {
//       gapi.load("auth2", () => {
//         gapi.auth2
//           .init({
//             client_id: CLIENT_ID,
//           })
//           .then((authInstance: any) => {
//             return authInstance.signIn();
//           })
//           .then((googleUser: any) => {
//             const idToken = googleUser.getAuthResponse().id_token;
//             sendGoogleUserData(idToken);
//           })
//           .catch((error: string) => {
//             console.log("Login failed", error);
//           });
//       });
//     }
//     router.push("/");
//   };

//   const sendGoogleUserData = (token: string) => {
//     var window: any;

//     // console.log(token);
//     return axios({
//       url: `${BASE_URL}/users/auth/google`,
//       method: "post",
//       headers: { accept: "application/json", Authorization: token },
//       data: { idToken: token, mode: "web" },
//     })
//       .then((res) => {
//         localStorage.setItem("AUTH", JSON.stringify(res.data));
//         axios({
//           method: "get",
//           url: `${BASE_URL}/users/me`,
//           headers: {
//             accept: "application/json",
//             Authorization: res.data.token,
//           },
//         }).then((res) => {
//           console.log(res.status);
//           // window.location.href = "/profile";
//         });
//       })
//       .catch((err) => {
//         console.log("error in google data", err);
//       });
//   };

//   return (
//     <main>
//       <Container
//         maxWidth='lg'
//         sx={{ display: "grid", placeItems: "center", gap: 6 }}
//       >
//         {/* <img src='/logo.svg' alt='logo' /> */}

//         <Box sx={{ display: "grid", gap: 4 }}>
//           {/* <img
//             src='/app-development.svg'
//             alt='app-development'
//             style={{ width: "100%" }}
//           /> */}

//           <Box sx={{ display: "grid", gap: 2 }}>
//             <Typography variant='body1' align='center' color='text.primary'>
//               Continue to C4CA
//             </Typography>
//             <GoogleIcon onClick={handleLoginSuccess}>
//               {/* <img src='/Google.svg' /> */}
//               <Typography>Login with Google</Typography>
//             </GoogleIcon>
//           </Box>
//         </Box>
//       </Container>
//     </main>
//   );
// };

// export default LoginPage;
