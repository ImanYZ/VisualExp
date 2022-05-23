import { getSortedPostsData } from "../lib/nodes";
import PagesNavbar from "../components/PagesNavbar";
import { GetServerSideProps, NextPage } from "next";
import { KnowledgeNode } from "../src/knowledgeTypes";
import Container from "@mui/material/Container";
import PopularNodes from "../components/PopularNodes";
import TrendingNodes from "../components/TrendingNodes";
import HomeSearch from "../components/HomeSearch";

type Props = {
  data: KnowledgeNode[];
};

export const getServerSideProps: GetServerSideProps<Props> = async ({}) => {
  const allPostsData = await getSortedPostsData();
  return {
    props: {
      data: allPostsData,
    },
  };
};

const Home: NextPage<Props> = ({ data }) => {
  return (
    <PagesNavbar>
      <Container>
        <HomeSearch sx={{ mb: 5 }}></HomeSearch>
        <PopularNodes nodes={data} sx={{ mb: 5 }} />
        <TrendingNodes nodes={data} />
      </Container>
    </PagesNavbar>
  );
};

export default Home;
