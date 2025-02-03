


# Helper Functions
def chunk_array(data_array, chunk_size):
    """
    Splits an array into smaller chunks.
    Args:
        data_array (list): The array to chunk.
        chunk_size (int): The maximum size of each chunk.
    Returns:
        list: A list of chunks.
    """
    return [data_array[i:i + chunk_size] for i in range(0, len(data_array), chunk_size)]


# import like this
# from utils.chunk import chunk_array