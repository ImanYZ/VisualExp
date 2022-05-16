import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Container from "@mui/material/Container";
import Typography from "../components/Typography";
import TextField from "../components/TextField";

function Copyright() {
  return (
    <React.Fragment>
      {"© "}
      {/* <Link color="inherit" target="_blank" href="/Home"> */}
      1Cademy
      {/* </Link> */} {new Date().getFullYear()}
    </React.Fragment>
  );
}

const iconStyle = {
  width: 48,
  height: 48,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "warning.main",
  mr: 1,
  "&:hover": {
    bgcolor: "warning.dark",
  },
};

const LANGUAGES = [
  {
    code: "en-US",
    name: "English",
  },
  {
    code: "fr-FR",
    name: "Français",
  },
];

export default function AppFooter() {
  return (
    <Typography
      component="footer"
      sx={{ display: "flex", bgcolor: "secondary.light" }}
    >
      <Container sx={{ my: 4, display: "flex" }}>
        <Grid container spacing={5}>
          <Grid item xs={6} sm={3}>
            <Copyright />
          </Grid>
          <Grid item xs={6} sm={2}>
            <Link target="_blank" href="/terms">
              Terms
            </Link>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Link target="_blank" href="/privacy">
              Privacy
            </Link>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Link target="_blank" href="/cookie">
              Cookie
            </Link>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box
              component="a"
              target="_blank"
              href="https://www.youtube.com/channel/UCKBqMjvnUrxOhfbH1F1VIdQ/"
            >
              <img
                src="/static/YouTube_Logo_2017.svg"
                alt="1Cademy YouTube Channel"
                width="100px"
              />
            </Box>
          </Grid>
          {/* <Grid item xs={6} sm={8} md={4}>
            <Typography variant="h6" marked="left" gutterBottom>
              Language
            </Typography>
            <TextField
              select
              size="medium"
              variant="standard"
              SelectProps={{
                native: true,
              }}
              sx={{ mt: 1, width: 150 }}
            >
              {LANGUAGES.map((language) => (
                <option value={language.code} key={language.code}>
                  {language.name}
                </option>
              ))}
            </TextField>
          </Grid> */}
        </Grid>
      </Container>
    </Typography>
  );
}
