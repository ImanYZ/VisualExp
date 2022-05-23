import { getSortedPostsData } from "../lib/nodes";
import PagesNavbar from "../components/PagesNavbar";
import { GetServerSideProps, NextPage } from "next";
import { KnowledgeNode } from "../src/knowledgeTypes";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import SearchInput from "../components/SearchInput";
import { Button } from "@mui/material";
import PopularNodes from "../components/PopularNodes";
import TrendingNodes from "../components/TrendingNodes";

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
  const handleSearch = (text: string) => {
    console.log("text", text);
  };

  return (
    <PagesNavbar>
      <Container>
        <Box sx={{ mb: 2, display: "flex", flexDirection: "row" }}>
          <SearchInput onSearch={handleSearch}></SearchInput>
          <Button>Search</Button>
        </Box>
        <PopularNodes nodes={data} sx={{ mb: 5 }} />
        <TrendingNodes nodes={data} />
      </Container>
    </PagesNavbar>
  );
};

export default Home;
