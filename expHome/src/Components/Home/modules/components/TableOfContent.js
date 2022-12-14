import { Box, Typography } from "@mui/material";
import React from 'react'

export const TableOfContent = ({ menuItems, onChangeContent }) => {
  return (
    <Box component={"nav"} sx={{ position: "sticky", top: "200px" }} style={{ mixBlendMode: "difference" }}>
      <Box
        component={"ul"}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          listStyle: "none",
          padding: 0
        }}
      >
        {menuItems.map((item) => (
          <Box component={"ul"}
            key={item.id}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              listStyle: "none",
              px: "10px",
            }}
          >
            <Typography sx={{
              color: "white",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
              ":hover": {
                color: "orange"
              }
            }}>
              {item.title}
            </Typography>
            {item.children.length && (
              <Box
                component={"ul"}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  listStyle: "outside",

                }}
              >
                {item.children.map((child) => (
                  <Box component={"li"} key={child.id} onClick={() => onChangeContent(child.target)}>
                    <Typography sx={{
                      fontSize: "16px", cursor: "pointer", ":hover": {
                        color: "orange"
                      },
                    }}>
                      {child.title}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box >
  )
}