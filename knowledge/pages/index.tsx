import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { GetServerSideProps, NextPage } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, { ComponentType } from "react";

import PagesNavbar from "../components/PagesNavbar";
import { getSortedPostsData } from "../lib/nodes";
import { KnowledgeNode } from "../src/knowledgeTypes";

type Props = {
  data: KnowledgeNode[];
};

const HomeSearchContainer: ComponentType<any> = dynamic(
  () => import("../components/HomeSearch").then(m => m.HomeSearch),
  { ssr: false }
);

const MasonryNodesContainer: ComponentType<any> = dynamic(
  () => import("../components/MasonryNodes").then(m => m.TrendingNodes),
  { ssr: false }
);

export const getServerSideProps: GetServerSideProps<Props> = async ({}) => {
  const allPostsData = await getSortedPostsData();
  return {
    props: {
      data: allPostsData || []
    }
  };
};

const HomePage: NextPage<Props> = ({ data }) => {
  const router = useRouter();

  const handleSearch = (text: string) => {
    router.push({ query: { q: text } });
  };

  return (
    <PagesNavbar>
      <HomeSearchContainer sx={{ mb: 5 }} onSearch={handleSearch} />
      {data && data.length > 0 ? (
        <MasonryNodesContainer nodes={data} />
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      )}
    </PagesNavbar>
  );
};

export default HomePage;
