import { getSortedPostsData } from "../lib/nodes";
import PagesNavbar from "../components/PagesNavbar";
import { GetServerSideProps, NextPage } from "next";
import { KnowledgeNode } from "../src/knowledgeTypes";
import TrendingNodes from "../components/TrendingNodes";
import HomeSearch from "../components/HomeSearch";
import { useRouter } from "next/router";

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

const HomePage: NextPage<Props> = ({ data }) => {
  const router = useRouter();

  const handleSearch = (text: string) => {
    router.push({ query: { q: text } });
  };

  return (
    <PagesNavbar>
      <HomeSearch sx={{ mb: 5 }} onSearch={handleSearch}></HomeSearch>
      <TrendingNodes nodes={data} />
    </PagesNavbar>
  );
};

export default HomePage;
