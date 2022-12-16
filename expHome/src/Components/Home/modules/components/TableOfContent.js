import { Box, Typography } from "@mui/material";
import React from 'react'

export const TableOfContent = ({ menuItems, onChangeContent }) => {
  return (
    <Box component={"nav"} sx={{ position: "sticky", top: "200px", }} style={{ mixBlendMode: "difference" }}>
      <Box
        component={"ul"}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          listStyle: "none",
          padding: 0,
          pl: "20px"
        }}
      >
        {menuItems.map((item, idx) => (
          <Box component={"ul"}
            key={item.id}
            sx={{
              color: item.active ? "#f1f1f1" : "#9c9c9c",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              listStyle: "none",
              borderLeft: "solid 1px #9c9c9c",
              px: "10px",
              position: "relative",
              "&::after": {
                content: '""',
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                position: "absolute",
                left: "-4px",
                top: "26px",
                background: item.active ? "#f1f1f1" : "#9c9c9c",
              },
              ":hover": {
                fontWeight: "700",
                color: "#ff8a33",
                "&::after": {
                  background: "#ff8a33"
                }
              },
            }}
          >
            <Typography
              onClick={() => onChangeContent(idx)}
              sx={{
                fontSize: "16px",
                py: "15px",
                cursor: "pointer",
                ":hover": {
                  fontWeight: "700",
                  color: "#ff8a33"
                }
              }}>
              {item.title}
            </Typography>
            {
              item.children.length > 0 && (
                <Box
                  component={"ul"}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    listStyle: "none",
                    pl: "15px"
                  }}
                >
                  {item.children.map((child, idx) => (
                    <Box component={"li"} key={child.id}>
                      <Typography
                        onClick={() => onChangeContent(1, idx)}
                        sx={{
                          color: child.active ? "#f1f1f1" : "#9c9c9c",
                          fontSize: "16px",
                          cursor: "pointer",
                          py: "5px",
                          ":hover": {
                            fontWeight: "700",
                            color: "#ff8a33"
                          },
                        }}>
                        {child.title}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )
            }
          </Box>
        ))}
      </Box>
    </Box >
  )
}