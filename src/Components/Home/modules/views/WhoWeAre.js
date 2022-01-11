import React from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";

import Typography from "../components/Typography";
import Button from "../components/Button";

function WhoWeAre() {
  return (
    <Container
      id="WhoWeAreSection"
      component="section"
      sx={{
        pt: 7,
        pb: 10,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        bgcolor: "secondary.light",
      }}
    >
      <Typography variant="h4" marked="center" sx={{ mb: 7 }}>
        Who Is Behind 1Cademy?
      </Typography>
      <Grid container>
        <Grid item xs={12} md={6} sx={{ zIndex: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              bgcolor: "warning.main",
              py: 8,
              px: 3,
            }}
          >
            <Typography variant="h2" component="h2" gutterBottom>
              Receive offers
            </Typography>
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          sx={{ display: { md: "block", xs: "none" }, position: "relative" }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -67,
              left: -67,
              right: 0,
              bottom: 0,
              width: "100%",
              background: "url(/static/CTAImageDots.png)",
            }}
          />
          <List
            sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
          >
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar
                  alt="Paul Resnick Picture"
                  src="/static/Paul_Resnick.jpg"
                  sx={{ width: 100, height: 130, mr: 2.5 }}
                />
              </ListItemAvatar>
              <ListItemText
                primary="1Cademy Advisor"
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: "inline" }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      Paul Resnick
                    </Typography>
                    {
                      " — Michael D Cohen Collegiate Professor of Information, Associate Dean for Research and Faculty Affairs and Professor of Information, University of Michigan, School of Information"
                    }
                  </React.Fragment>
                }
              />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar
                  alt="Iman YeckehZaare Picture"
                  src="/static/Iman_YeckehZaare.jpeg"
                  sx={{ width: 100, height: 130, mr: 2.5 }}
                />
              </ListItemAvatar>
              <ListItemText
                primary="1Cademy Architect & Developer"
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: "inline" }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      Iman YeckehZaare
                    </Typography>
                    {
                      " — Ph.D. Candidate and Best Graduate Student Instructor of the Year 2018-2019 at the University of Michigan, School of Information"
                    }
                  </React.Fragment>
                }
              />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar
                  alt="Iman YeckehZaare Picture"
                  src="/static/Iman_YeckehZaare.jpeg"
                  sx={{ width: 100, height: 130, mr: 2.5 }}
                />
              </ListItemAvatar>
              <ListItemText
                primary="1Cademy Architect"
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: "inline" }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      Iman YeckehZaare
                    </Typography>
                    {
                      " — Ph.D. Candidate and Best Graduate Student Instructor of the Year 2018-2019 at the University of Michigan, School of Information"
                    }
                  </React.Fragment>
                }
              />
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </Container>
  );
}

export default WhoWeAre;
