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
        {menuItems.map((item) => (
          <Box component={"ul"}
            key={item.id}
            sx={{
              color: item.active ? "#f1f1f1" : "#666666",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              listStyle: "none",
              borderLeft: "solid 1px #666666",
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
                background: item.active ? "#f1f1f1" : "#666666",
                // border: "solid 1px #666666",
              }
            }}
          >
            <Typography sx={{
              fontSize: "16px",
              // fontWeight: "700",
              py: "20px",
              cursor: "pointer",
              ":hover": {
                color: "orange"
              }
            }}>
              {item.title}
            </Typography>
            {item.children.length > 0 && (
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
                {item.children.map((child) => (
                  <Box component={"li"} key={child.id} onClick={() => onChangeContent(child.target)}>
                    <Typography sx={{
                      fontSize: "16px",
                      cursor: "pointer",
                      py: "10px",
                      ":hover": {
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