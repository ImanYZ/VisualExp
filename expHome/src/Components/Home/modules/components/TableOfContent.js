import { Box, Tooltip, Typography } from "@mui/material";
import React from 'react'

export const TableOfContent = ({ menuItems, onChangeContent, viewType, customSx }) => {

  return (
    <Box component={"nav"} sx={{ position: "sticky", top: "200px", ...customSx }} style={{ mixBlendMode: "difference" }}>
      <Box
        component={"ul"}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          listStyle: "none",
          padding: 0,
          pl: viewType === "SIMPLE" ? "8px" : "15px"
        }}
      >
        {menuItems.map((item, idx) => (
          <Box component={"li"}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
            }}
          >
            <Tooltip key={item.id} title={item.title} placement="right" arrow disableInteractive>
              <Box onClick={() => onChangeContent(idx)}
                sx={{
                  height: "56px",
                  color: item.active ? "#f1f1f1" : "#9c9c9c",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  listStyle: "none",
                  borderLeft: "solid 1px #9c9c9c",
                  px: viewType === "SIMPLE" ? "0px" : "10px",
                  position: "relative",
                  "&::before": {
                    content: '""',
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    position: "absolute",
                    left: "-4px",
                    top: "22px",
                    background: item.active ? "#f1f1f1" : "#9c9c9c",
                    outline: item.active ? "solid 4px #8d8d8d7a" : undefined
                  },
                  ":hover": {
                    color: "#ff8a33",
                    "&::before": {
                      background: "#ff8a33"
                    }
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: "16px",
                    py: "15px",
                    cursor: "pointer",
                    ":hover": {
                      color: "#ff8a33"
                    }
                  }}>
                  {viewType === "COMPLETE" && item.title}
                  {viewType === "NORMAL" && item.simpleTitle}
                  {viewType === "SIMPLE" && " "}
                </Typography>
              </Box>
            </Tooltip>

            {
              item.children.length > 0 && (
                <Box
                  component={"ul"}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    listStyle: "none",
                    pl: viewType === "SIMPLE" ? "0px" : "18px",
                    borderLeft: "solid 1px #9c9c9c",
                  }}
                >
                  {item.children.map((child, idx) => (
                    <Tooltip key={child.id} title={child.title} placement="right" arrow disableInteractive>
                      <Box
                        component={"li"}
                        onClick={() => onChangeContent(1, idx)}
                        sx={{
                          height: "36px",
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          "&::before": {
                            content: '""',
                            width: "5px",
                            height: "5px",
                            borderRadius: "50%",
                            position: "absolute",
                            left: viewType === "SIMPLE" ? "-3px" : "-21px",
                            top: "16px",
                            background: child.active ? "#f1f1f1" : "#9c9c9c",
                            outline: child.active ? "solid 3px #8d8d8d7a" : undefined
                          },
                          ":hover": {
                            color: "#ff8a33",
                            "&::before": {
                              background: "#ff8a33"
                            }
                          }
                        }}>
                        <Typography
                          sx={{
                            color: child.active ? "#f1f1f1" : "#9c9c9c",
                            fontSize: "14px",
                            cursor: "pointer",
                            py: "5px",
                            ":hover": {
                              color: "#ff8a33"
                            }
                          }}>
                          {viewType === "COMPLETE" && child.title}
                          {viewType === "NORMAL" && child.simpleTitle}
                          {viewType === "SIMPLE" && " "}
                          &nbsp;
                        </Typography>
                      </Box>
                    </Tooltip>
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